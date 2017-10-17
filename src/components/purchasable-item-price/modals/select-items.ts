import { SalesTax } from './../../../model/salesTax';
import { PriceBookService } from './../../../services/priceBookService';
import _ from 'lodash';
import { ViewController, NavParams } from 'ionic-angular';
import { AppService } from './../../../services/appService';
import { LoadingController } from 'ionic-angular';
import { Component, NgZone } from '@angular/core';

@Component({
  selector: 'select-items-modal',
  templateUrl: 'select-items.html'
})
export class SelectPurchasableItemsModel {

  public items: any[] = [];
  public itemsBackup: any[] = [];
  private defaultTax: any;

  constructor(
    private navParms: NavParams,
    private loading: LoadingController,
    private appService: AppService,
    private viewCtrl: ViewController,
    private zone: NgZone,
    private priceBookService: PriceBookService
  ) { }

  ionViewDidLoad() {
    let loader = this.loading.create({
      content: 'Loading items...'
    });
    loader.present().then(() => {
      let exclude: string[] = this.navParms.get('exclude') as string[];
      this.defaultTax = this.navParms.get('defaultTax');
      this.appService.getAllPurchasableItems().then((items: any[]) => {
        this.zone.run(() => {
          this.items = _.filter(items, value => !(exclude.indexOf(value._id) > -1)).map(item => {
            item.selected = false;
            return item;
          });
          this.itemsBackup = this.items;
        });
      }).catch(error => {
        throw new Error(error);
      }).then(() => loader.dismiss());
    });
  }

  public searchItems(event) {
    // search for items
    this.items = this.itemsBackup;
    var val = event.target.value;

    if (val && val.trim() != '') {
      this.items = this.items.filter((item) => {
        return ((item.name).toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }    
  }


  public dismiss() {
    this.viewCtrl.dismiss();
  }

  public confirm() {
    let filtered: any[] = _.filter(this.items, item => item.selected);
    if (filtered.length > 0) {
      let loader = this.loading.create({
        content: 'Please wait...'
      });
      loader.present().then(() => {
        let confirmed: any[] = [];

        this.priceBookService.getDefault().then(priceBook => {
          let prices: any[] = priceBook.purchasableItems;
          filtered.forEach((value, index, array) => {
            let i = _.findIndex(prices, { id: value._id });
            if (i > -1) {
              confirmed.push({
                name: value.name,
                entityTypeName: value.entityTypeName,
                ...prices[i],
                tax: this.defaultTax || new SalesTax()
              });
            }
          });
          this.viewCtrl.dismiss({ items: confirmed });
        }).catch(error => {
          throw new Error(error);
        }).then(() => loader.dismiss());
      });
    } else {
      this.dismiss();
    }
  }
}