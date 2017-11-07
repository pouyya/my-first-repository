import _ from 'lodash';
import * as moment from 'moment';
import { Observable } from 'rxjs/Rx';
import { EmployeeTimestamp } from './../../../../../model/employeeTimestamp';
import { EmployeeTimestampService } from './../../../../../services/employeeTimestampService';
import { GlobalConstants } from './../../../../../metadata/globalConstants';
import { ViewController, LoadingController } from 'ionic-angular';
import { NavParams } from 'ionic-angular';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: "time-log-details-modal",
  templateUrl: "time-log-details.html"
})
export class TimeLogDetailsModal implements OnInit {

  public timestamps: any[];
  public employee: any;
  public date: string;
  public actionHash: any = GlobalConstants.TIME_LOG_ACTION;
  public actionBtns: any = {};
  public currentDate: string;
  public clock: Observable<Date> = Observable
    .interval(1000)
    .map(() => new Date());
  private deleted: any[] = [];

  constructor(
    private navParams: NavParams,
    private viewCtrl: ViewController,
    private timestampService: EmployeeTimestampService,
    private loading: LoadingController
  ) {
    this.timestamps = _.cloneDeep(this.navParams.get('timestamps'));
    this.employee = this.navParams.get('employee');
    this.date = this.navParams.get('date');
    // breakTimeLogs
    let dateMoment = moment(this.date, "dddd, Do MMMM YYYY");
    let currentDate = moment();
    dateMoment
      .hour(currentDate.hour())
      .minute(currentDate.minute())
      .second(currentDate.second());
    this.currentDate = dateMoment.toDate().toISOString();
    _.forEach(this.actionHash, (value, key) => {
      this.actionBtns[key] = {
        text: value,
        enabled: true
      }
    });
  }

  ngOnInit() {
    this.evaluateActionBtns();
  }

  public deleteEntry(timestamp: any, index) {
    this.deleted.push(timestamp);
    this.timestamps.splice(index, 1);
    this.evaluateActionBtns();
  }

  public saveChanges() {
    let loader = this.loading.create({
      content: 'Saving changes...'
    });

    loader.present().then(() => {
      let deletions: Promise<any>[] = [];
      let updates: Promise<any>[] = [];
      let updatedModels: any[] = [];
      if (this.timestamps.length > 0) {
        this.timestamps.forEach(timestamp => {
          updatedModels.push(timestamp);
          updates.push(this.timestampService.update(
            <EmployeeTimestamp>_.omit(timestamp, ['employee', 'store'])
          ));
        });
      }
      if (this.deleted.length > 0) {
        this.deleted.forEach(timestamp => {
          deletions.push(this.timestampService.delete(
            <EmployeeTimestamp>_.omit(timestamp, ['employee', 'store'])
          ))
        });
      }

      Promise.all(updates.concat(deletions)).catch().then(() => {
        loader.dismiss();
        this.viewCtrl.dismiss(updatedModels);
      });
    });
  }

  public async addTimeLog(type) {
    try {
      let timestamp = new EmployeeTimestamp();
      timestamp.employeeId = this.employee._id;
      timestamp.storeId = this.employee.storeId;
      timestamp.type = type;
      timestamp.time = new Date(this.currentDate);
      await this.timestampService.add(timestamp);
      this.timestamps.push(timestamp);
      this.evaluateActionBtns();
      return;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  private evaluateActionBtns() {
    this.actionBtns.clock_in.enabled = (() => {
      let item = _.find(this.timestamps, { type: 'clock_in' });
      return !item;
    })();

    this.actionBtns.clock_out.enabled = (() => {
      let item = _.find(this.timestamps, { type: 'clock_out' });
      return !item;
    })();

    let breakTimeLogs = _.filter(this.timestamps, log => log.type == 'break_start' || log.type == 'break_end');
    if(breakTimeLogs.length > 0) {
      breakTimeLogs.sort(function (a, b) {
        return new Date(b.time).getTime() - new Date(a.time).getTime();
      });
      if (breakTimeLogs[breakTimeLogs.length - 1].type == 'break_start') {
        this.actionBtns.break_start.enabled = false;
        this.actionBtns.break_end.enabled = true;
      } else if (breakTimeLogs[breakTimeLogs.length - 1].type == 'break_end') {
        this.actionBtns.break_start.enabled = true;
        this.actionBtns.break_end.enabled = false;
      }
    }

  }

  public dismiss() {
    this.viewCtrl.dismiss();
  }

}