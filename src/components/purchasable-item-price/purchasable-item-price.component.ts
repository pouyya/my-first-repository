import { AppService } from './../../services/appService';
import { UserService } from './../../services/userService';
import { GroupSaleTax } from './../../model/groupSalesTax';
import { PurchasableItemPriceInterface } from './../../model/purchasableItemPrice.interface';
import _ from 'lodash';
import { SelectPurchasableItemsModel } from './modals/select-items';
import { ModalController } from 'ionic-angular';
import { SalesTax } from './../../model/salesTax';
import { SalesTaxService } from './../../services/salesTaxService';
import { PriceBookService } from './../../services/priceBookService';
import { PriceBook } from './../../model/priceBook';
import { Component, Input, OnChanges, NgZone, Output, EventEmitter } from '@angular/core';

interface InteractableItemPriceInterface extends PurchasableItemPriceInterface {
  name: string,
  entityTypeName: string;
  tax: SalesTax | GroupSaleTax;
  deleted: boolean;
}

interface ComponentOptions {
  enableAddidtion: boolean;
  enableDeletion: boolean;
}

@Component({
  selector: 'purchasable-item-price',
  templateUrl: 'purchasable-item-price.html',
  styleUrls: []
})
export class PurchasableItemPriceComponent implements OnChanges {

  public _priceBook: PriceBook;
  public items: InteractableItemPriceInterface[] = [];
  private user: any;
  private defaultTax: any;

  @Input("priceBook")
  set priceBook(value: PriceBook) {
    this._priceBook = value;
    this.priceBookChange.emit(value);
  }
  get priceBook() {
    return this._priceBook;
  }
  @Input() salesTaxes?: any[];
  @Input() showConfirmBtn?: boolean = false;
  @Input() options: ComponentOptions = { enableAddidtion: true, enableDeletion: true };
  @Output() priceBookChange: EventEmitter<PriceBook> = new EventEmitter<PriceBook>();

  constructor(
    private priceBookService: PriceBookService,
    private salesTaxService: SalesTaxService,
    private modalCtrl: ModalController,
    private userService: UserService,
    private appService: AppService,
    private zone: NgZone
  ) {
    this.user = this.userService.getLoggedInUser();
  }

  ngOnChanges(): void {
    let salesPromises: Promise<any>[] = [];
    if (!this.salesTaxes || this.salesTaxes.length == 0) {
      salesPromises = [
        new Promise((_resolve, _reject) => {
          this.salesTaxService.get(this.user.settings.defaultTax).then((salesTax: any) => {
            salesTax.name = ` ${salesTax.name} (Default)`;
            _resolve({
              ...salesTax,
              isDefault: true,
              noOfTaxes: salesTax.entityTypeName == 'GroupSaleTax' ? salesTax.salesTaxes.length : 0
            });
          }).catch(error => {
            if (error.name == "not_found") {
              _resolve(null);
            } else _reject(error);
          });
        }),
        new Promise((_resolve, _reject) => {
          this.appService.loadSalesAndGroupTaxes().then((salesTaxes: Array<any>) => {
            _resolve(salesTaxes);
          }).catch(error => _reject(error));
        }),
      ];
    } else {
      salesPromises.push(Promise.resolve(null));
    }

    Promise.all(salesPromises).then(results => {
      this.salesTaxes = [];
      if (results != null && results.length > 0) {
        if (results[0] != null) {
          this.defaultTax = results[0]
          this.salesTaxes.push(this.defaultTax);
        }
        if(results[1] != null && results[1].length > 0) {
          this.salesTaxes = this.salesTaxes.concat(results[1]);
        }
      }

      if (this._priceBook && this._priceBook._id && this._priceBook.purchasableItems.length > 0) {
        let fetchItems: Promise<any>[] = [];
        let items: InteractableItemPriceInterface[] = [];
        this._priceBook.purchasableItems.forEach(item => {
          fetchItems.push(new Promise((res, rej) => {
            this.priceBookService.get(item.id).then(model => {
              items.push({
                name: model.name,
                entityTypeName: model.entityTypeName,
                ...item,
                tax: ((_id) => {
                  if (_id == null) {
                    return this.defaultTax;
                  } else {
                    let tax = _.find(this.salesTaxes, { _id });
                    return tax || this.defaultTax;
                  }

                })(item.salesTaxId),
                deleted: false
              });
              res();
            }).catch(error => res());
          }));
        });

        Promise.all(fetchItems).then(() => {
          this.items = items;
        }).catch(error => {
          throw new Error(error);
        });
      }

    }).catch(error => {
      throw new Error(error);
    });
  }

  public calculate(type, item): void {
    this.zone.runOutsideAngular(() => {
      switch (type) {
        case 'supplyPrice':
          item.markup = this.priceBookService.calculateMarkup(item.supplyPrice, item.retailPrice);
          break;
        case 'markup':
          if (item.supplyPrice !== 0) {
            item.retailPrice = this.priceBookService.calculateRetailPriceTaxInclusive(
              Number(item.supplyPrice), Number(item.markup)
            );
            item.inclusivePrice = this.priceBookService.calculateRetailPriceTaxInclusive(
              Number(item.retailPrice), Number(item.tax.rate)
            );
          }
          break;
        case 'retailPrice':
          item.markup = this.priceBookService.calculateMarkup(item.supplyPrice, item.retailPrice);
          item.inclusivePrice = this.priceBookService.calculateRetailPriceTaxInclusive(
            Number(item.retailPrice), Number(item.tax.rate)
          );
          break;
        case 'salesTax':
          item.inclusivePrice = this.priceBookService.calculateRetailPriceTaxInclusive(
            Number(item.retailPrice), Number(item.tax.rate)
          );
          break;
        case 'inclusivePrice':
          item.retailPrice = this.priceBookService.calculateRetailPriceTaxExclusive(
            Number(item.inclusivePrice), Number(item.tax.rate)
          );
          item.markup = this.priceBookService.calculateMarkup(item.supplyPrice, item.retailPrice);
          break;
      }
    });
  }

  public addItemsModal(): void {
    let exclude: string[] = this.items.map((item: any) => item._id);
    let modal = this.modalCtrl.create(SelectPurchasableItemsModel, { exclude, defaultTax: this.defaultTax });
    modal.onDidDismiss(data => {
      if (data && data.hasOwnProperty('items') && data.items.length > 0) {
        this.items = this.items.concat(data.items);
      }
    });
    modal.present();
  }

  public deleteItem(item, index): void {
    item.deleted = true;
  }

  public confirmChanges(): void {
    // should be called using ViewChild from parent
    // if there is no Confirm button used in this component
    this._priceBook.purchasableItems = [];
    this.items.forEach(item => {
      if (!item.deleted) {
        this._priceBook.purchasableItems.push({
          ..._.omit<PurchasableItemPriceInterface,InteractableItemPriceInterface>(item, ['name', 'entityTypeName', 'tax', 'deleted'])
        })
      }
    });
    return;
  }

}