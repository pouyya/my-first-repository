// Agular Library Imports
import { Component } from '@angular/core';
// Ionic Library Imports
import { IonicPage, NavParams, ModalController, ViewController } from 'ionic-angular';
// Our Custom Imports
import { StoreService } from "../../../../services/storeService";
// Other Imports
import * as moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-shift-modal',
  templateUrl: 'shift-modal.html',
})
export class ShiftModalPage {

  // To hold shift data
  public shiftData: any = {};
  // To hold mode, New or Edit
  public mode: string;
  // To hold Employee Name
  public empName: string;
  // To hold today's date
  public todayDate: Date = new Date();
  // note
  public note: string;
  // To hold employee list
  public employeeList: Array<any> = [];

  constructor(public modalCtrl: ModalController, public viewCtrl: ViewController, public navParams: NavParams, private storeService: StoreService) {
  }

  /**
   * Ionic Lifecycle event for component initialization
   */
  ionViewWillEnter() {
    this.employeeList = this.navParams.get('employees');
    this.mode = this.navParams.get('mode');
    this.shiftData = this.navParams.get('shiftData');
    this.todayDate = this.shiftData.start;
    if (this.shiftData.other !== undefined && this.shiftData.other.shift !== undefined && this.shiftData.other.shift._id !== undefined) {
      setTimeout(() => {
        this.employeeList.filter(
          (emp) => {
            if (this.shiftData.other.shift._id === emp._id) {
              this.empName = emp;
            }
          }
        );
      }, 700)
    }
    if (this.shiftData.note !== undefined) {
      this.note = this.shiftData.note;
    }
    //
    if (this.mode === 'Edit') {
      this.empName = this.shiftData.other.shift.firstname +' '+ this.shiftData.other.shift.lastname;
    }
  }
  
  /**
   * To close modal
   */
  public dismiss(shiftData: any) {
    // add note
    if (this.note !== undefined && this.note !== '') {
      this.shiftData['note'] = this.note;
    }
    // Prepare object for new mode
    if (this.mode === 'New' && this.shiftData.hasOwnProperty('other') === true && this.shiftData.other.shift === undefined) {
      this.shiftData.other.shift = this.empName;
    }
    this.viewCtrl.dismiss(shiftData);
  }

  /**
   * Open delete modal
   */
  public deleteShiftModal() {
    if (this.mode === 'New') {
      this.shiftData['isDeleted'] = true;
      this.dismiss(this.shiftData);
    } else {
      let deleteShift = this.modalCtrl.create('DeleteShiftModalPage', {'empName': this.empName});
      deleteShift.onDidDismiss(
        (decision: boolean) => {
          if (decision === true) {
            this.shiftData['isDeleted'] = true;
            this.dismiss(this.shiftData);
          }
        }
      );
      deleteShift.present();
    }
  }

  /**
   * Trigger when open hours get changed
   */
  public openHoursChanged(updatedTime: any): void {
    // update time in proper format
    const time24 = moment(updatedTime, ["h:mm A"]).format("HH:mm");
    const splitedTime = time24.split(':');
    let time = {
      hour:   +splitedTime[0],
      minute: +splitedTime[1],
    };
    // Prepare object for new mode
    if (this.mode === 'New' && this.shiftData.hasOwnProperty('other') === true && this.shiftData.other !== undefined && this.shiftData.other.workingDay === undefined) {
      this.shiftData.other.workingDay = {};
      this.shiftData.other.workingDay.day = '';
      this.shiftData.other.workingDay.openHours = {};
    }
    this.shiftData.other.workingDay.openHours.open = moment(this.shiftData.other.workingDay.openHours.open).set(time).toISOString();
  }

  /**
   * Trigger when close hours get changed
   */
  public closeHoursChanged(updatedTime: any): void {
    // update time in proper format
    const time24 = moment(updatedTime, ["h:mm A"]).format("HH:mm");
    const splitedTime = time24.split(':');
    let time = {
      hour:   +splitedTime[0],
      minute: +splitedTime[1],
    };
    // Prepare object for new mode
    if (this.mode === 'New' && this.shiftData.hasOwnProperty('other') === true && this.shiftData.other !== undefined && this.shiftData.other.workingDay === undefined) {
      this.shiftData.other.workingDay = {};
      this.shiftData.other.workingDay.openHours = {};
    }
    this.shiftData.other.workingDay.openHours.close = moment(this.shiftData.other.workingDay.openHours.open).set(time).toISOString();
  }
}
