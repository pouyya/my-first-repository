import * as moment from 'moment-timezone';
import _ from 'lodash';
import { Reason } from './../../../../model/stockHistory';
import { NavParams, ViewController } from 'ionic-angular';
import { Component } from "@angular/core";
import { StockHistory } from '../../../../model/stockHistory';
import { TypeHelper } from '@simplepos/core/dist/utility/typeHelper';
import { EmployeeService } from '../../../../services/employeeService';
import { SyncContext } from '../../../../services/SyncContext';
import { DateTimeService } from '../../../../services/dateTimeService';

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
        private employeeService: EmployeeService,
        private syncContext: SyncContext,
        private dateTimeService: DateTimeService
    ) {
        let increaseReasons: string[] = [
            Reason.NewStock,
            Reason.Return,
            Reason.Transfer,
            Reason.Adjustment,
            Reason.InitialValue,
            Reason.Other
        ];
        this.storesStock = this.navParams.get('storesStock');
        let reasons = TypeHelper.enumToObject(Reason, 'string');
        Object.keys(reasons).forEach(reason => {
            if (increaseReasons.indexOf(reason) != -1) {
                this.reasons[reason] = reasons[reason];
            }
        });
        this.stock.productId = this.navParams.get('productId');
        const storeId = this.syncContext.currentStore && this.syncContext.currentStore._id;
        this.stock.storeId = (storeId) ? storeId : this.storesStock[0].storeId;
        this.stock.reason = this.reasons[Object.keys(this.reasons)[0]];
        this.setStore();
    }

    public setStore() {
        this.currentStore = _.find(this.storesStock, { storeId: this.stock.storeId });
    }

    public increase() {
        this.stock.createdAt = this.dateTimeService.getUTCDateString();
        this.stock.createdAtLocalDate = this.dateTimeService.getLocalDateString();
        this.stock.value = Number(this.stock.value);
        this.stock.createdBy = this.employeeService.getEmployee()._id;
        this.stock.supplyPrice = this.stock.supplyPrice ? Number(this.stock.supplyPrice) : null;
        if (this.stock.value > 0) {
            this.viewCtrl.dismiss(this.stock);
        }
    }

    public dismiss() {
        this.viewCtrl.dismiss();
    }

}