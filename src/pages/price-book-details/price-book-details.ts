import { PriceBookService } from './../../services/priceBookService';
import { StoreCriteria } from './../../model/StoreCriteria';
import { NgZone } from '@angular/core';
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
  public stores: Array<any> = [];
  public isNew: boolean = true;
  public action: string = 'Add';
  public criteria: CritieriaView = {
    store: {
      disabled: false,
      provider: 'StoreEvaluationProvider',
      construct(storeIds: string[]) {
        let criteria = new StoreCriteria();
        criteria.storeIds = storeIds;
        return criteria;
      }
    },
    customerTypes: {
      disabled: false,
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

  constructor(
    private storeService: StoreService,
    private priceBookService: PriceBookService,
    private platform: Platform,
    private loading: LoadingController,
    private navParams: NavParams,
    private navCtrl: NavController,
    private zone: NgZone
  ) {
 
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
            loader.dismiss();
          });
        }).catch(error => {
          throw new Error(error);
        })
      });
    });
  }

  public onSubmit(): void {
    if(this.isNew) {
      if(!this.criteria.store.disabled) {
        this.priceBook.criteria.push({
          provider: this.criteria.store.provider,
          criteria: this.criteria.store.construct((() => {
            return this.stores.filter(store => store.selected).map(store => store._id);
          })())
        })
      }
      this.priceBookService.add(this.priceBook).then(() => {
        this.navCtrl.pop();
      });
    } else {

    }
  }

}