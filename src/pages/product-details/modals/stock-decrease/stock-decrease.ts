import * as moment from 'moment-timezone';
import _ from 'lodash';
import { Reason } from './../../../../model/stockHistory';
import { NavParams, ViewController } from 'ionic-angular';
import { Component } from "@angular/core";
import { StockHistory } from '../../../../model/stockHistory';
import { TypeHelper } from '@simpleidea/simplepos-core/dist/utility/typeHelper';
import { EmployeeService } from '../../../../services/employeeService';
import { SyncContext } from '../../../../services/SyncContext';

@Component({
  selector: 'stock-decrease-modal',
  templateUrl: 'stock-decrease.html'
})
export class StockDecreaseModal {

  public storesStock: any[] = [];
  public stock: StockHistory = new StockHistory();
  public currentStore: any = {};
  public reasons: any[] = [];
  public storeId: string;

  constructor(
    private navParams: NavParams,
    private viewCtrl: ViewController,
    private employeeService: EmployeeService,
    private syncContext: SyncContext
  ) {
    let decreaseReasons: string[] = [
      Reason.InternalUse,
      Reason.Damaged,
      Reason.OutOfDate,
      Reason.Adjustment,
      Reason.Other
    ];
    this.storesStock = this.navParams.get('storesStock');
    let reasons = TypeHelper.enumToObject(Reason, 'string');
    Object.keys(reasons).forEach(reason => {
      if (decreaseReasons.indexOf(reason)!= -1 ) {
        this.reasons[reason] = reasons[reason];
      }
    });
    this.stock.productId = this.navParams.get('productId');
    this.storeId = this.syncContext.currentStore && this.syncContext.currentStore._id;
    this.stock.storeId = (this.storeId)?this.storeId:this.storesStock[0].storeId;
    this.stock.reason = this.reasons[Object.keys(this.reasons)[0]];
    this.setStore();
  }

  public setStore() {
    this.currentStore = _.find(this.storesStock, { storeId: this.stock.storeId });
  }

  public decrease() {
    this.stock.createdAt = moment().utc().format();
    this.stock.createdBy = this.employeeService.getEmployee()._id;
    this.stock.value = Number(this.stock.value) * -1;
    if (this.stock.value != 0) {
      this.viewCtrl.dismiss(this.stock);
    }
  }

  public dismiss() {
    this.viewCtrl.dismiss();
  }

}