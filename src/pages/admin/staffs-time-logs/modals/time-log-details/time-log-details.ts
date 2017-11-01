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

  public deleteEntry() {

  }

  public async saveChanges() {
    let loader = this.loading.create({
      content: 'Saving changes...'
    });

    try {
      await loader.present();
      let updates: Promise<any>[] = [];
      let updatedModels: any[] = [];
      this.timestamps.forEach(timestamp => {
        updatedModels.push(timestamp);
        let model = <EmployeeTimestamp>_.omit(timestamp, ['employee', 'store']);
        updates.push(this.timestampService.update(model));
      });
      await Promise.all(updates);
      loader.dismiss();
      this.viewCtrl.dismiss(updatedModels);
    } catch (err) {
      throw new Error(err);
    }
  }

  public dismiss() {
    this.viewCtrl.dismiss();
  }

}