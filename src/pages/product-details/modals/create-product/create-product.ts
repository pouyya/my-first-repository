import * as moment from 'moment-timezone';
import _ from 'lodash';
import {LoadingController, NavParams, ViewController} from 'ionic-angular';
import {ChangeDetectorRef, Component, NgZone} from "@angular/core";
import {StoreService} from "../../../../services/storeService";
import {UserService} from "../../../../modules/dataSync/services/userService";
import {Product} from "../../../../model/product";
import {ProductService} from "../../../../services/productService";
import {PriceBook} from "../../../../model/priceBook";
import {PriceBookService} from "../../../../services/priceBookService";
import {PurchasableItemPriceInterface} from "../../../../model/purchasableItemPrice.interface";
import {AppService} from "../../../../services/appService";
import {SalesTaxService} from "../../../../services/salesTaxService";

interface InteractableItemPriceInterface {
    id: string;
    tax: any,
    item: PurchasableItemPriceInterface,
    isDefault: boolean
}

@Component({
  selector: 'create-product-modal',
  templateUrl: 'create-product.html'
})
export class CreateProductModal {

  public productItem: Product = new Product();
  private _defaultPriceBook: PriceBook;
  public salesTaxes: Array<any> = [];
  public defaultPriceBook: InteractableItemPriceInterface = {
      id: "",
      tax: {},
      item: {
          id: "",
          retailPrice: 0,
          inclusivePrice: 0,
          supplyPrice: 0,
          markup: 0,
          salesTaxId: ""
      },
      isDefault: false
  };
  private categories = [];
  constructor(
    private navParams: NavParams,
    private viewCtrl: ViewController,
    private loading: LoadingController,
    private cdr: ChangeDetectorRef,
    private storeService: StoreService,
    private userService: UserService,
    private productService: ProductService,
    private appService: AppService,
    private priceBookService: PriceBookService,
    private salesTaxService: SalesTaxService,
    private zone: NgZone,
  ) {

  }

  async ionViewDidLoad() {
      let loader = this.loading.create({
          content: 'Loading Product...',
      });
      await loader.present();
      var _user = await this.userService.getUser();
      let stores = await this.storeService.getAll();
      this.categories = this.navParams.get('categories');
      this.productItem.icon = _user.settings.defaultIcon;
      let defaultTax: any = await this.salesTaxService.get(_user.settings.defaultTax);

      const salesTaxes = await this.appService.loadSalesAndGroupTaxes();
      if( defaultTax ){
          defaultTax.name = ` ${defaultTax.name} (Default)`;
          this.salesTaxes.push({
              ...defaultTax,
              isDefault: true,
              noOfTaxes: defaultTax.entityTypeName == 'GroupSaleTax' ? defaultTax.salesTaxes.length : 0
          });
      }
      this.salesTaxes = this.salesTaxes.concat(salesTaxes);
      this._defaultPriceBook = await this.priceBookService.getDefault();
      this.defaultPriceBook.id = this._defaultPriceBook._id;
      this.defaultPriceBook.isDefault = true;
      this.defaultPriceBook.tax = this.salesTaxes[0];
      loader.dismiss();
  }

  public async createProduct(){
      var product = await this.productService.add(this.productItem);
      this._defaultPriceBook.purchasableItems.push({
          id: product._id,
          retailPrice: Number(this.defaultPriceBook.item.retailPrice),
          inclusivePrice: Number(this.defaultPriceBook.item.inclusivePrice),
          supplyPrice: Number(this.defaultPriceBook.item.supplyPrice),
          markup: Number(this.defaultPriceBook.item.markup),
          salesTaxId: this.defaultPriceBook.tax.hasOwnProperty('isDefault') && this.defaultPriceBook.tax.isDefault ? null : this.defaultPriceBook.tax._id,
          saleTaxEntity: this.defaultPriceBook.tax.entityTypeName
      });

      await this.priceBookService.update(this._defaultPriceBook);
      this.viewCtrl.dismiss({status: true, product});
  }

  public calculate(type, itemPrice: InteractableItemPriceInterface) {
      this.zone.runOutsideAngular(() => {
          switch (type) {
              case 'supplyPrice':
                  itemPrice.item.markup = this.priceBookService.calculateMarkup(itemPrice.item.supplyPrice, itemPrice.item.retailPrice);
                  break;
              case 'markup':
                  if (itemPrice.item.supplyPrice !== 0) {
                      itemPrice.item.retailPrice = this.priceBookService.calculateRetailPriceTaxInclusive(
                          Number(itemPrice.item.supplyPrice), Number(itemPrice.item.markup)
                      );
                      itemPrice.item.inclusivePrice = this.priceBookService.calculateRetailPriceTaxInclusive(
                          Number(itemPrice.item.retailPrice), Number(itemPrice.tax.rate)
                      );
                  }
                  break;
              case 'retailPrice':
                  itemPrice.item.markup = this.priceBookService.calculateMarkup(itemPrice.item.supplyPrice, itemPrice.item.retailPrice);
                  itemPrice.item.inclusivePrice = this.priceBookService.calculateRetailPriceTaxInclusive(
                      Number(itemPrice.item.retailPrice), Number(itemPrice.tax.rate)
                  );
                  break;
              case 'salesTax':
                  itemPrice.item.inclusivePrice = this.priceBookService.calculateRetailPriceTaxInclusive(
                      Number(itemPrice.item.retailPrice), Number(itemPrice.tax.rate)
                  );
                  break;
              case 'inclusivePrice':
                  itemPrice.item.retailPrice = this.priceBookService.calculateRetailPriceTaxExclusive(
                      Number(itemPrice.item.inclusivePrice), Number(itemPrice.tax.rate)
                  );
                  itemPrice.item.markup = this.priceBookService.calculateMarkup(itemPrice.item.supplyPrice, itemPrice.item.retailPrice);
                  break;
          }
      });
  }

  public dismiss() {
    this.viewCtrl.dismiss();
  }

}