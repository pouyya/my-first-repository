import { EmployeeTimestamp } from './../../../model/employeeTimestamp';
import { Employee } from './../../../model/employee';
import { Store } from './../../../model/store';
import _ from 'lodash';
import * as moment from 'moment';
import { StoreService } from './../../../services/storeService';
import { LoadingController } from 'ionic-angular';
import { EmployeeTimestampService } from './../../../services/employeeTimestampService';
import { EmployeeService } from './../../../services/employeeService';
import { Component, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'staffs-time-logs',
  templateUrl: 'staffs-time-logs.html',
  styleUrls: []
})
export class StaffsTimeLogs {

  public timeLogs: any;
  private timeQuery: any;
  private timeDifference: number = 30;
  private timeKey: string = 'days';
  private timeFrames: any[] = [];
  private employees: any;
  private stores: any;
  private nextTime: any;

  constructor(
    private cdr: ChangeDetectorRef,
    private employeeService: EmployeeService,
    private employeeTimestampService: EmployeeTimestampService,
    private storeService: StoreService,
    private loading: LoadingController
  ) {
    this.setNextTimeFrame(moment());
  }

  async ionViewDidEnter() {
    let loader = this.loading.create({
      content: 'Loading Time Logs...',
    });
    await loader.present();

    this.cdr.detach();

    function groupById(collection) {
      let grouped = _.groupBy(collection, "_id");
      let corrected: any = {};
      Object.keys(grouped).forEach(key => {
        corrected[key] = grouped[key][0]
      });
      return corrected;
    }

    let promises: any[] = [
      async () => {
        try {
          let employees: Employee[] = await this.employeeService.getAll();
          return groupById(employees);
        } catch (err) {
          return Promise.reject(err);
        }
      },
      async () => {
        try {
          let stores: Store[] = await this.storeService.getAll();
          return groupById(stores);
        } catch (err) {
          return Promise.reject(err);
        }
      },
      async () => {
        try {
          return await this.employeeTimestampService.getTimestampsfromTo(
            this.timeQuery.start.toISOString(),
            this.timeQuery.end.toISOString(),
            false
          );
        } catch (err) {
          return Promise.reject(err);
        }
      }
    ];
    let [employees, stores, timestamps] = await Promise.all(promises.map(promise => promise()));
    this.employees = employees;
    this.stores = stores;
    this.groupTimeLogs(timestamps);

    this.cdr.reattach();
    loader.dismiss();

  }

  public async loadMore(infiniteScroll) {
    this.setNextTimeFrame();
    let timestamps = await this.employeeTimestampService.getTimestampsfromTo(
      this.timeQuery.start.toISOString(),
      this.timeQuery.end.toISOString(),
      false      
    );
    this.groupTimeLogs(timestamps);
    infiniteScroll.complete();
  }

  private groupTimeLogs(timestamps: EmployeeTimestamp[]): void {
    let groupedByDate: any = {};
    let days: any[] = [];

    this.timeFrames.forEach(frame => {
      days.push({
        start: frame.clone().startOf('day'),
        end: frame.clone().endOf('day')
      })
    });

    days.forEach(day => {
      let key = day.start.format("dddd, Do MMMM YYYY");
      groupedByDate[key] = [];
      timestamps.forEach(log => {
        if (moment(log.time).isSameOrAfter(day.start) && moment(log.time).isSameOrBefore(day.end)) {
          groupedByDate[key].push({
            ...log,
            employee: this.employees[log.employeeId],
            store: this.stores[log.storeId]
          });
        }
      });
      if (groupedByDate[key].length == 0) {
        delete groupedByDate[key];
      } else {
        groupedByDate[key] = _.groupBy(groupedByDate[key], "employeeId");
      }
    });

    console.warn(groupedByDate);
    this.timeLogs = groupedByDate;
  }

  private setNextTimeFrame(startDate) {
    this.timeFrames = [startDate];
    for (let i = 1; i < this.timeDifference; i++) {
      this.timeFrames.push(startDate.clone().subtract(i, this.timeKey));
    }

    this.timeQuery = { start: this.timeFrames[0], end: this.timeFrames[this.timeFrames.length - 1] }
  }

}