import _ from 'lodash';
import * as moment from 'moment';
import { TimeLogDetailsModal } from './modals/time-log-details/time-log-details';
import { AlertController } from 'ionic-angular';
import { ModalController } from 'ionic-angular';
import { EmployeeTimestamp } from './../../../model/employeeTimestamp';
import { Employee } from './../../../model/employee';
import { Store } from './../../../model/store';
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

  public timeLogs: any = {};
  private timeDifference: number = 7;
  private timeKey: string = 'days';
  private timeFrame: any[] = [];
  private employees: any;
  private stores: any;
  private stopLoading: boolean = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private employeeService: EmployeeService,
    private employeeTimestampService: EmployeeTimestampService,
    private storeService: StoreService,
    private loading: LoadingController,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController
  ) {
    this.setNextTimeFrame();
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
          return await this.employeeTimestampService.getTimestampsByFrame(
            this.timeFrame.map(day => day.format('YYYY-M-D')),
            this.timeDifference
          );
        } catch (err) {
          return Promise.reject(err);
        }
      }
    ];
    let [employees, stores, timestamps] = await Promise.all(promises.map(promise => promise()));
    await this.employeeService.logOutAllStaffs();
    this.employees = employees;
    this.stores = stores;
    this.groupTimeLogs(timestamps);

    this.cdr.reattach();
    loader.dismiss();

  }

  public viewLogs($event: any) {
    let modal = this.modalCtrl.create(TimeLogDetailsModal, {
      timestamps: $event.timestamps,
      employee: $event.employee.firstName,
      date: $event.dateKey
    })
    modal.onDidDismiss(data => {
      if (data) {
        if(data.length > 0) {
          this.timeLogs[$event.dateKey][$event.employee._id] = data;
        } else {
          delete this.timeLogs[$event.dateKey][$event.employee._id];
          if (Object.keys(this.timeLogs[$event.dateKey]).length == 0) {
            delete this.timeLogs[$event.dateKey];
          }          
        }
      }
    });
    modal.present();
  }

  public removeAll($event: any) {
    let confirm = this.alertCtrl.create({
      title: 'Delete timelogs ?',
      message: `Do you wish to delete all ${$event.employeeName}'s timelogs for ${$event.date} ?`,
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            let loader = this.loading.create({ content: "Deleting..." });
            loader.present().then(() => {
              let logsToDelete = this.timeLogs[$event.date][$event.employee._id];
              let promises: Promise<any>[] = [];
              logsToDelete.forEach(log => promises.push(
                this.employeeTimestampService.delete(_.omit(log, ['employee', 'store']))
              ));

              Promise.all(promises).then(() => {
                delete this.timeLogs[$event.date][$event.employee._id];
                if (Object.keys(this.timeLogs[$event.date]).length == 0) {
                  delete this.timeLogs[$event.date];
                }

              }).catch(err => {
                throw new Error(err);
              }).then(() => loader.dismiss());
            });
          }
        },
        'No'
      ]
    });

    confirm.present();
  }

  public async loadMore(infiniteScroll) {
    if (this.stopLoading) {
      infiniteScroll.complete();
      return;
    }
    this.setNextTimeFrame();
    let timestamps = await this.employeeTimestampService.getTimestampsByFrame(
      this.timeFrame.map(day => day.format('YYYY-M-D')),
      this.timeDifference
    );
    if (timestamps.length > 0) {
      this.groupTimeLogs(timestamps);
    } else {
      this.stopLoading = true;
    }
    infiniteScroll.complete();
    return;
  }

  private groupTimeLogs(timestamps: EmployeeTimestamp[]): void {
    let groupedByDate: any = {};
    let days: any[] = [];

    this.timeFrame.forEach(frame => {
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

    // this.timeLogs = _.cloneDeep(groupedByDate);

    Object.keys(groupedByDate).forEach(day => {
      this.timeLogs[day] = _.cloneDeep(groupedByDate[day]);
    });
    return;
  }

  private setNextTimeFrame() {
    let startDate: any;
    startDate = this.timeFrame.length === 0 ?
      moment() :
      this.timeFrame[this.timeFrame.length - 1].clone().subtract(1, this.timeKey);
    this.timeFrame.push(startDate);

    for (let i = 1; i < this.timeDifference; i++) {
      this.timeFrame.push(startDate.clone().subtract(i, this.timeKey));
    }
  }

}