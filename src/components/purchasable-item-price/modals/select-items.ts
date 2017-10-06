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
      this.appService.getAllPurchasableItems().then((items: any[]) => {
        this.zone.run(() => {
          this.items = _.filter(items, value => !(exclude.indexOf(value._id) > -1)).map(item => {
            item.selected = false;
            return item;
          });
        });
      }).catch(error => {
        throw new Error(error);
      }).then(() => loader.dismiss());
    });
  }

  public searchItems() {
    // search for items
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

        this.priceBookService.getDefaultPriceBook().then(priceBook => {
          let prices: any[] = priceBook.purchasableItems;
          filtered.forEach((value, index, array) => {
            let i = _.findIndex(prices, { id: value._id });
            if (i > -1) {
              confirmed.push({
                name: value.name,
                entityTypeName: value.entityTypeName,
                ...prices[i]
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