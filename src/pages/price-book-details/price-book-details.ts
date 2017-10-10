import _ from 'lodash';
import { PurchasableItemPriceComponent } from './../../components/purchasable-item-price/purchasable-item-price.component';
import { PriceBookService } from './../../services/priceBookService';
import { StoreCriteria } from './../../model/StoreCriteria';
import { NgZone, ViewChild } from '@angular/core';
import { PriceBook } from './../../model/priceBook';
import { Platform, LoadingController, NavParams, NavController } from 'ionic-angular';
import { StoreService } from './../../services/storeService';
import { Component } from '@angular/core';

interface CritieriaView {
  store?: {
    disabled: boolean,
    provider: string,
    construct(storeIds: string[]): StoreCriteria
  },
  customerTypes?: {
    disabled: boolean,
    provider: string,
    construct(): void
  }
}

@Component({
  selector: 'pricebook-details',
  templateUrl: 'price-book-details.html',
  styleUrls: ['/pages/price-book-details/price-book-details.scss']
})
export class PriceBookDetails {

  public priceBook: PriceBook = new PriceBook();
  public isDefault: boolean = false;
  public stores: Array<any> = [];
  public isNew: boolean = true;
  public action: string = 'Add';
  public criteria: CritieriaView = {
    store: {
      disabled: true,
      provider: 'StoreEvaluationProvider',
      construct(storeIds: string[]) {
        let criteria = new StoreCriteria();
        criteria.storeIds = storeIds;
        return criteria;
      }
    },
    customerTypes: {
      disabled: true,
      provider: 'CustomerTypeEvaluationProvider',
      construct() { }
    }
  };
  public customerTypes: any = {
    any: 'Any',
    gold: 'Gold',
    silver: 'Silver',
    bronze: 'Bronze'
  };
  public generalOptions: any = { enableAddition: true, enableDeletion: true };
  public defaultOptions: any = { enableAddition: false, enableDeletion: false };

  private criteriaHash: any = {};

  @ViewChild(PurchasableItemPriceComponent)
  private purchasableItemPriceComponent: PurchasableItemPriceComponent;

  constructor(
    private storeService: StoreService,
    private priceBookService: PriceBookService,
    private platform: Platform,
    private loading: LoadingController,
    private navParams: NavParams,
    private navCtrl: NavController,
    private zone: NgZone
  ) {
    Object.keys(this.criteria).forEach(key => {
      this.criteriaHash[this.criteria[key].provider] = key;
    });
  }

  ionViewDidLoad() {
    this.platform.ready().then(() => {
      let loader = this.loading.create({
        content: 'Loading...',
      });

      loader.present().then(() => {
        let priceBook: PriceBook = this.navParams.get('priceBook') as PriceBook;
        if (priceBook) {
          this.priceBook = priceBook;
          this.isNew = false;
          this.action = 'Edit';
          this.priceBook.priority == 0 && ( this.isDefault = true );
          if(this.isDefault) {
            Object.keys(this.criteria).forEach((key, index, array) => {
              this.criteria[key].disabled = true;
            });
          }
        }
        let promises: Promise<any>[] = [
          this.storeService.getAll()
        ];

        Promise.all(promises).then((result: any[]) => {
          this.zone.run(() => {
            this.stores = result.shift();
            this.stores = this.stores.map(store => {
              store.selected = false;
              return store;
            })
            if (!this.isNew) {
              this.priceBook.criteria.forEach(criteria => {
                if (this.criteriaHash.hasOwnProperty(criteria.provider)) {
                  this.criteria[this.criteriaHash[criteria.provider]].disabled = false;

                  if (criteria.provider == "StoreEvaluationProvider") {
                    this.stores.forEach((store, index, stores) => {
                      if (criteria.criteria.storeIds.indexOf(store._id) > -1) {
                        stores[index].selected = true;
                      }
                    });
                  }
                }
              });
            }
            loader.dismiss();
          });
        }).catch(error => {
          throw new Error(error);
        })
      });
    });
  }

  public onCheck(event, store) {
    store.selected = !store.selected;
  }

  public onSubmit(): void {
    if (this.isNew) {
      if (!this.criteria.store.disabled) {
        this.priceBook.criteria.push({
          provider: this.criteria.store.provider,
          criteria: this.criteria.store.construct((() => {
            return this.stores.filter(store => store.selected).map(store => store._id);
          })())
        })
      }

      this.purchasableItemPriceComponent.confirmChanges();
      this.priceBook.createdAt = new Date();

      this.priceBookService.add(this.priceBook).then(() => {
        this.navCtrl.pop();
      });
    } else {
      this.purchasableItemPriceComponent.confirmChanges();
      let index = _.findIndex(this.priceBook.criteria, { provider: 'StoreEvaluationProvider' });
      if (index > -1) {
        if (this.criteria.store.disabled) {
          this.priceBook.criteria.splice(index, 1);
        } else {
          this.priceBook.criteria[index].criteria = this.criteria.store.construct((() => {
            return this.stores.filter(store => store.selected).map(store => store._id);
          })());
        }
      } else {
        if (!this.criteria.store.disabled) {
          this.priceBook.criteria.push({
            provider: this.criteria.store.provider,
            criteria: this.criteria.store.construct((() => {
              return this.stores.filter(store => store.selected).map(store => store._id);
            })())
          })
        }
      }
      this.priceBookService.update(this.priceBook).then(() => {
        this.navCtrl.pop();
      });
    }
  }

  public remove() {

  }
}