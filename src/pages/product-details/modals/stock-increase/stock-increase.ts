import _ from 'lodash';
import { Reason } from './../../../../model/stockHistory';
import { NavParams, LoadingController, ViewController } from 'ionic-angular';
import { Component } from "@angular/core";
import { StockHistory } from '../../../../model/stockHistory';
import { TypeHelper } from '../../../../utility/typeHelper';

@Component({
  selector: 'stock-increase-modal',
  templateUrl: 'stock-increase.html'
})
export class StockIncreaseModal {

  public storesStock: any[] = [];
  public stock: StockHistory = new StockHistory();
  public currentStore: any = {};
  public reasons: any[] = [];

  constructor(
    private navParams: NavParams,
    private loading: LoadingController,
    private viewCtrl: ViewController
  ) {
    let increaseReasons: string[] = ['NewStock', 'Return', 'Transfer', 'Adjustment', 'Other'];
    this.storesStock = this.navParams.get('storesStock');
    let reasons = TypeHelper.enumToObject(Reason, 'string');
    Object.keys(reasons).forEach(reason => {
      if(increaseReasons.indexOf(reason) > 0) {
        this.reasons[reason] = reasons[reason];
      }
    });
    this.stock.storeId = this.storesStock[0].storeId;
    this.stock.reason = this.reasons[Object.keys(this.reasons)[0]];
    this.setStore();
  }

  public setStore() {
    this.currentStore = _.find(this.storesStock, { storeId: this.stock.storeId });
  }

  public increase() {

  }

  public dismiss() {
    this.viewCtrl.dismiss();
  }

}