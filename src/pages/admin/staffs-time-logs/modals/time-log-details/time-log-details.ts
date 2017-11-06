import _ from 'lodash';
import { EmployeeTimestamp } from './../../../../../model/employeeTimestamp';
import { EmployeeTimestampService } from './../../../../../services/employeeTimestampService';
import { GlobalConstants } from './../../../../../metadata/globalConstants';
import { ViewController, LoadingController } from 'ionic-angular';
import { NavParams } from 'ionic-angular';
import { Component } from '@angular/core';

@Component({
  selector: "time-log-details-modal",
  templateUrl: "time-log-details.html"
})
export class TimeLogDetailsModal {

  public timestamps: any[];
  public employeeName: string;
  public date: string;
  public actionHash: any = GlobalConstants.TIME_LOG_ACTION;
  private deleted: any[] = [];

  constructor(
    private navParams: NavParams,
    private viewCtrl: ViewController,
    private timestampService: EmployeeTimestampService,
    private loading: LoadingController
  ) {
    this.timestamps = _.cloneDeep(this.navParams.get('timestamps'));
    this.employeeName = this.navParams.get('employeeName');
    this.date = this.navParams.get('date');
  }

  public deleteEntry(timestamp: any, index) {
    this.deleted.push(timestamp);
    this.timestamps.splice(index, 1);
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

  public dismiss() {
    this.viewCtrl.dismiss();
  }

}