import * as moment from 'moment-timezone';
import _ from 'lodash';
import { Reason } from './../../../../model/stockHistory';
import { NavParams, ViewController } from 'ionic-angular';
import { Component } from "@angular/core";
import { StockHistory } from '../../../../model/stockHistory';
import { TypeHelper } from '@simpleidea/simplepos-core/dist/utility/typeHelper';
import { EmployeeService } from '../../../../services/employeeService';

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
    private viewCtrl: ViewController,
    private employeeService: EmployeeService
  ) {
    let increaseReasons: string[] = [
      Reason.InitialValue,
      Reason.NewStock,
      Reason.Return,
      Reason.Transfer,
      Reason.Adjustment,
      Reason.Other
    ];
    this.storesStock = this.navParams.get('storesStock');
    let reasons = TypeHelper.enumToObject(Reason, 'string');
    Object.keys(reasons).forEach(reason => {
      if(increaseReasons.indexOf(reason)!= -1 ) {
        this.reasons[reason] = reasons[reason];
      }
    });
    this.stock.productId = this.navParams.get('productId');
    this.stock.storeId = this.storesStock[0].storeId;
    this.stock.reason = this.reasons[Object.keys(this.reasons)[0]];
    this.setStore();
  }

  public setStore() {
    this.currentStore = _.find(this.storesStock, { storeId: this.stock.storeId });
  }

  public increase() {
    this.stock.createdAt = moment().utc().format();
    this.stock.value = Number(this.stock.value);
    this.stock.createdBy = this.employeeService.getEmployee()._id;
    this.stock.supplyPrice = (this.stock.supplyPrice >= 0 ? Number(this.stock.supplyPrice) : 1 );
    if(this.stock.value > 0 && this.stock.supplyPrice > 0) {
      this.viewCtrl.dismiss(this.stock);
    }
  }

  public dismiss() {
    this.viewCtrl.dismiss();
  }

}