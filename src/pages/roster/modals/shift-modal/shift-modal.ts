// Agular Library Imports
import { Component } from '@angular/core';
// Ionic Library Imports
import { IonicPage, NavParams, ModalController, ViewController } from 'ionic-angular';
// Our Custom Imports
import { StoreService } from "../../../../services/storeService";
// Other Imports
import * as moment from 'moment';
import * as _ from 'lodash';
import { ShiftStatus } from "../../../../model/shift";
import { Employee } from 'model/employee';

@Component({
  selector: 'page-shift-modal',
  templateUrl: 'shift-modal.html',
})
export class ShiftModalPage {

  // To hold shift data
  public shiftData: any = {};
  public startDate;
  public endDate;
  // To hold mode, New or Edit
  public mode: string;
  // To hold Employee Name
  public empId: string;
  public empName: string;
  // To hold today's date
  public todayDate;
  // note
  public note: string;
  // To hold employee list
  public employeeList: Array<Employee> = [];
  private totalInHours: number = 0;
  private shiftLength: number = 0;
  constructor(public modalCtrl: ModalController, public viewCtrl: ViewController, public navParams: NavParams, private storeService: StoreService) {
  }

  /**
   * Ionic Lifecycle event for component initialization
   */
  ionViewWillEnter() {
    this.employeeList = this.navParams.get('employees');
    this.mode = this.navParams.get('mode');
    this.shiftData = this.navParams.get('shiftData');
    this.totalInHours = this.navParams.get('totalInHours');
    this.shiftLength = this.navParams.get('shiftLength');
    if (this.shiftData.startDate && this.shiftData.endDate) {
      this.startDate = moment(this.shiftData.startDate).format("HH:mm");
      this.endDate = moment(this.shiftData.endDate).format("HH:mm");
    }
    this.todayDate = this.navParams.get('start');
    if (this.mode === "Edit") {
      this.empId = this.shiftData.employeeId;
    }
    // if (this.shiftData.other !== undefined && this.shiftData.other.shift !== undefined && this.shiftData.other.shift._id !== undefined) {
    //   setTimeout(() => {
    //     this.employeeList.filter(
    //       (emp) => {
    //         if (this.shiftData.other.shift._id === emp._id) {
    //           this.empName = emp;
    //         }
    //       }
    //     );
    //   }, 700)
    // }
    // if (this.shiftData.note !== undefined) {
    //   this.note = this.shiftData.note;
    // }
    // //
    // if (this.mode === 'Edit') {
    //   this.empName = this.shiftData.other.shift.firstName +' '+ this.shiftData.other.shift.lastname;
    // }
  }

  /**
   * To close modal
   */
  public dismiss() {
    this.viewCtrl.dismiss({ status: 'Dismiss' });
  }

  /**
   * To close modal
   */
  public onClose() {
    // add note
    if (!this.startDate || !this.endDate || !this.empId) {
      return;
    }
    let splittedTime = this.startDate.split(':');
    let time = {
      hour: +splittedTime[0],
      minute: +splittedTime[1],
    };
    let dateTime = moment();
    dateTime.set(time);
    this.shiftData['employeeId'] = this.empId;
    this.shiftData['status'] = ShiftStatus.Draft;

    this.shiftData.startDate = dateTime;
    this.shiftData.startDate.month(this.todayDate.month());
    this.shiftData.startDate.date(this.todayDate.date());
    this.shiftData.startDate.year(this.todayDate.year());

    splittedTime = this.endDate.split(':');
    time = {
      hour: +splittedTime[0],
      minute: +splittedTime[1],
    };
    dateTime = moment();
    dateTime.set(time);

    this.shiftData.endDate = dateTime;
    this.shiftData.endDate.month(this.todayDate.month());
    this.shiftData.endDate.date(this.todayDate.date());
    this.shiftData.endDate.year(this.todayDate.year());

    this.shiftData.startDate = this.shiftData.startDate.toISOString();
    this.shiftData.endDate = this.shiftData.endDate.toISOString();

    if (this.note !== undefined && this.note !== '') {
      this.shiftData['note'] = this.note;
    }
    this.shiftData['break'] ? this.shiftData['break'] = Number(this.shiftData['break']) : this.shiftData['break'] = 0;

    this.viewCtrl.dismiss({ status: this.mode, empName: this.getEmployeeName(this.empId), shift: this.shiftData });
  }

  /**
   * Open delete modal
   */

  private getEmployeeName(id: string): string {
    const employee = _.find(this.employeeList, { _id: id });
    return `${employee.firstName} ${employee.lastName}`;
  }
  public deleteShiftModal() {
    if (this.mode === 'New') {
      this.dismiss();
    } else {
      const empName = this.getEmployeeName(this.empId);
      let deleteShift = this.modalCtrl.create('DeleteShiftModalPage', { empName });
      deleteShift.onDidDismiss(
        (decision: boolean) => {
          if (decision === true) {
            this.viewCtrl.dismiss({ status: 'Delete', shift: this.shiftData });
          }
        }
      );
      deleteShift.present();
    }
  }

  /**
   * Trigger when open hours get changed
   */
  public onHoursChanged(updatedTime: any, type: string): void {
    // update time in proper format
    // const time24 = moment(updatedTime, ["h:mm A"]).format("HH:mm");
    const splitedTime = updatedTime.split(':');
    let time = {
      hour: +splitedTime[0],
      minute: +splitedTime[1],
    };
    // Prepare object for new mode
    const dateTime = moment();
    dateTime.set(time);
    switch (type) {
      case "OPEN":
        this.shiftData.startDate = updatedTime;
        break;
      case "CLOSE":
        this.shiftData.endDate = updatedTime;
        break;
    }

  }

}
