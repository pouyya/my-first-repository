import _ from 'lodash';
import { SelectPurchasableItemsModel } from './modals/select-items';
import { ModalController } from 'ionic-angular';
import { SalesTax } from './../../model/salesTax';
import { SalesTaxService } from './../../services/salesTaxService';
import { PriceBookService } from './../../services/priceBookService';
import { PriceBook } from './../../model/priceBook';
import { Component, Input, OnChanges, NgZone } from '@angular/core';

@Component({
  selector: 'purchasable-item-price',
  templateUrl: 'purchasable-item-price.html',
  styleUrls: []
})
export class PurchasableItemPriceComponent implements OnChanges {

  public _priceBook: PriceBook;
  public items: object[] = [];

  @Input("priceBook")
  set priceBook(value: PriceBook) {
    this._priceBook = value;
  }
  get priceBook() {
    return this._priceBook;
  }
  @Input() salesTaxes?: any[];

  constructor(
    private priceBookService: PriceBookService,
    private salesTaxService: SalesTaxService,
    private modalCtrl: ModalController,
    private zone: NgZone
  ) {

  }

  ngOnChanges() {
    if (this._priceBook && this._priceBook._id && this._priceBook.purchasableItems.length > 0) {

      let setSalesTaxes: Promise<any[]> = new Promise((resolve, reject) => {
        if (!this.salesTaxes || this.salesTaxes.length == 0) {
          this.salesTaxService.getAll().then((taxes: SalesTax[]) => {
            this.salesTaxes = taxes;
            resolve();
          }).catch(error => reject(error));
        } else resolve();
      });

      setSalesTaxes.then(() => {
        let fetchItems: Promise<any>[] = [];
        let items: any[] = [];
        this._priceBook.purchasableItems.forEach(item => {
          fetchItems.push(new Promise((res, rej) => {
            this.priceBookService.get(item.id).then(model => {
              items.push({
                name: model.name,
                entityTypeName: model.entityTypeName,
                ...item,
                tax: _.find(this.salesTaxes, { _id: item.salesTaxId }) || null,
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
      }).catch(error => {
        throw new Error(error);
      });

    }

  }

  public calculate(type, item) {
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

  public addItemsModal() {
    let exclude: string[] = this.items.map((item: any) => item._id);
    let modal = this.modalCtrl.create(SelectPurchasableItemsModel, { exclude });
    modal.onDidDismiss(data => {
      if (data && data.hasOwnProperty('items') && data.items.length > 0) {
        this.items = this.items.concat(data.items);
      }
    });
    modal.present();
  }

  public deleteItem(item, index) {
    item.deleted = true;
  }

}