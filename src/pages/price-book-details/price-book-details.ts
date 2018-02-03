import _ from 'lodash';
import { ToastController } from 'ionic-angular';
import { DaysOfWeekCriteria } from './../../model/DaysOfWeekCriteria';
import { AlertController } from 'ionic-angular';
import { PurchasableItemPriceComponent } from './../../components/purchasable-item-price/purchasable-item-price.component';
import { PriceBookService } from './../../services/priceBookService';
import { StoreCriteria } from './../../model/StoreCriteria';
import { NgZone, ViewChild } from '@angular/core';
import { PriceBook } from './../../model/priceBook';
import { Platform, LoadingController, NavParams, NavController } from 'ionic-angular';
import { StoreService } from './../../services/storeService';
import { Component } from '@angular/core';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';

interface CritieriaView {
  store?: {
    disabled: boolean,
    provider: string,
    construct(storeIds: string[]): StoreCriteria
  };
  daysOfWeek?: {
    disabled: boolean,
    provider: string,
    construct(days: object): DaysOfWeekCriteria
  };
  customerTypes?: {
    disabled: boolean,
    provider: string,
    construct(): void
  }
}

@SecurityModule(SecurityAccessRightRepo.PriceBookAddEdit)
@Component({
  selector: 'pricebook-details',
  templateUrl: 'price-book-details.html',
  styleUrls: ['price-book-details.scss']
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
      construct(storeIds: string[]): StoreCriteria {
        let criteria = new StoreCriteria();
        criteria.storeIds = storeIds;
        return criteria;
      }
    },
    daysOfWeek: {
      disabled: true,
      provider: 'DaysOfWeekEvaluationProvider',
      construct(days: any[]): DaysOfWeekCriteria {
        let criteria = new DaysOfWeekCriteria();
        days.filter(day => day.selected).forEach(day => {
          criteria.days[day.value] = day.selected;
        });

        return criteria;
      }
    },
    customerTypes: {
      disabled: true,
      provider: 'CustomerTypeEvaluationProvider',
      construct() { }
    }
  };

  public days: any[] = [];
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
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private zone: NgZone
  ) {
    this.days = [
      { value: 'mon', label: 'Monday', selected: false },
      { value: 'tue', label: 'Tuesday', selected: false },
      { value: 'wed', label: 'Wednesday', selected: false },
      { value: 'thu', label: 'Thursday', selected: false },
      { value: 'fri', label: 'Friday', selected: false },
      { value: 'sat', label: 'Saturday', selected: false },
      { value: 'sun', label: 'Sunday', selected: false }
    ];
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
          this.priceBook.priority == PriceBookService.MAX_PRIORITY && (this.isDefault = true);
          if (this.isDefault) {
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

                  switch (criteria.provider) {
                    case this.criteria.store.provider:
                      this.stores.forEach((store, index, stores) => {
                        if (criteria.criteria.storeIds.indexOf(store._id) > -1) {
                          stores[index].selected = true;
                        }
                      });
                      break;

                    case this.criteria.daysOfWeek.provider:
                      this.days.forEach((day, index, arr) => {
                        if(criteria.criteria.days[day.value]) {
                          arr[index].selected = true;
                        }
                      });
                      break;
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

  public clearField(property) {
    if (this.priceBook.hasOwnProperty(property) && this.priceBook[property]) {
      this.priceBook[property] = null;
    }
  }

  public onSubmit(): void {
    if(this.priceBook.priority >= PriceBookService.MAX_PRIORITY && !this.isDefault) {
      this.showFormError("Priority must be greater than 0");
      return;
    }

    if (this.isNew) {
      if (!this.criteria.store.disabled) {
        this.priceBook.criteria.push({
          provider: this.criteria.store.provider,
          criteria: this.criteria.store.construct((() => {
            return this.stores.filter(store => store.selected).map(store => store._id);
          })())
        })
      }

      if (!this.criteria.daysOfWeek.disabled) {
        this.priceBook.criteria.push({
          provider: this.criteria.daysOfWeek.provider,
          criteria: this.criteria.daysOfWeek.construct(this.days)
        });
      }

      this.purchasableItemPriceComponent.confirmChanges();
      this.priceBook.createdAt = new Date();
      this.priceBook.priority = Number(this.priceBook.priority);

      this.priceBookService.add(this.priceBook).then(() => {
        this.navCtrl.pop();
      });
    } else {
      this.purchasableItemPriceComponent.confirmChanges();
      let index = _.findIndex(this.priceBook.criteria, { provider: this.criteria.store.provider });
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

      index = _.findIndex(this.priceBook.criteria, { provider: this.criteria.daysOfWeek.provider });
      if (index > -1) {
        if (this.criteria.daysOfWeek.disabled) {
          this.priceBook.criteria.splice(index, 1);
        } else {
          this.priceBook.criteria[index].criteria = this.criteria.daysOfWeek.construct(this.days);
        }
      } else {
        if (!this.criteria.daysOfWeek.disabled) {
          this.priceBook.criteria.push({
            provider: this.criteria.daysOfWeek.provider,
            criteria: this.criteria.daysOfWeek.construct(this.days)
          });
        }
      }

      this.priceBook.priority = Number(this.priceBook.priority);
      this.priceBookService.update(this.priceBook).then(() => {
        this.navCtrl.pop();
      });
    }
  }

  public showFormError(message, duration?: number) {
    let toast = this.toastCtrl.create({
      message, duration: duration || 3000
    });
    toast.present();
  }

  public remove() {
    let confirm = this.alertCtrl.create({
      title: 'Are you sure you want to delete this Price Book ?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.priceBookService.delete(this.priceBook)
              .then(() => this.navCtrl.pop())
              .catch(error => {
                throw new Error(error);
              })
          }
        }, 'No'
      ]
    });

    confirm.present();
  }
}