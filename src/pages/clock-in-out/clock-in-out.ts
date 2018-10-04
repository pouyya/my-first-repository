import { Employee, WorkingStatus, WorkingStatusEnum } from './../../model/employee';
import { ToastController, ViewController, LoadingController } from 'ionic-angular';
import { EmployeeService } from './../../services/employeeService';
import { PluginService } from './../../services/pluginService';
import { Component, NgZone } from '@angular/core';
import { SalesModule } from "../../modules/salesModule";
import { PageModule } from './../../metadata/pageModule';
import { EmployeeTimestampService } from './../../services/employeeTimestampService';
import { EmployeeTimestamp } from './../../model/employeeTimestamp';
import { SharedService } from './../../services/_sharedService';
import { Observable } from 'rxjs/Rx';
import { POS } from '../../model/store';
import { StoreService } from '../../services/storeService';
import { SyncContext } from "../../services/SyncContext";
import { DateTimeService } from './../../services/dateTimeService';
import * as moment from 'moment-timezone';

import _ from "lodash";
import { MOMENT } from 'angular-calendar';

@PageModule(() => SalesModule)
@Component({
  selector: 'clock-in-out',
  templateUrl: 'clock-in-out.html'
})
export class ClockInOutPage {


  public employee: Employee;
  public employeeAlias: string;
  public pos: POS;
  public dataLoaded: boolean = false;
  public timestamp: EmployeeTimestamp;
  public buttons: any;
  public activeButtons: Array<any> = [];
  public messagePlaceholder: string = "";
  public clock: Observable<Date> = Observable
    .interval(1000)
    .map(() => new Date());
  private mappingTimestamp = {
    [WorkingStatusEnum.ClockedIn]: EmployeeTimestampService.CLOCK_IN,
    [WorkingStatusEnum.ClockedOut]: EmployeeTimestampService.CLOCK_OUT,
    [WorkingStatusEnum.BreakStart]: EmployeeTimestampService.BREAK_START,
    [WorkingStatusEnum.BreakEnd]: EmployeeTimestampService.BREAK_END
  }
  constructor(
    private _sharedService: SharedService,
    private pluginService: PluginService,
    private employeeService: EmployeeService,
    private employeeTimestampService: EmployeeTimestampService,
    private toastCtrl: ToastController,
    private viewCtrl: ViewController,
    private storeService: StoreService,
    private loading: LoadingController,
    private zone: NgZone,
    private dateTimeService: DateTimeService,
    private syncContext: SyncContext
  ) {

  }

  /**
   * @AuthGuard
   */
  async ionViewCanEnter(): Promise<boolean> {
    if (!this.syncContext.currentPos.status) {
      let toast = this.toastCtrl.create({
        message: "POS is closed!",
        duration: 3000
      });
      toast.present();

      return false;
    }
    let pin = await this.pluginService.openPinPrompt('Enter PIN', 'User Authorization', [],
      { ok: 'OK', cancel: 'Cancel' });
    if (!pin) {
      return false;
    }

    /** Check PIN against conditions */
    let loader = this.loading.create({ content: 'Verifying PIN' });
    await loader.present();

    this.employee = await this.zone.runOutsideAngular(async () => {
      let employee: Employee = await this.employeeService.findByPin(pin);
      let toast = this.toastCtrl.create({ duration: 3000 });

      if (!employee) {
        toast.setMessage('Invalid PIN!');
        toast.present();
        return null;
      }

      !employee.workingStatus && (employee.workingStatus = <WorkingStatus>{});

      this.employeeAlias = (employee.firstName || "") + " " + (employee.lastName || "");
      this.employeeAlias = (this.employeeAlias.trim() == "" ? "Employee" : this.employeeAlias);

      if (!employee.isAdmin && !employee.isActive) {
        toast.setMessage('Employee not Active!');
        toast.present();
        return null;
      }

      if (!employee.isAdmin && !_.find(employee.store || [], { id: this.syncContext.currentStore._id })) {
        toast.setMessage(`You dont have access for '${this.syncContext.currentStore.name}'.`);
        toast.present();
        return null;
      }

      if (employee.workingStatus && employee.workingStatus.storeId
        && employee.workingStatus.storeId !== this.syncContext.currentStore._id
        && employee.workingStatus.status !== WorkingStatusEnum.ClockedOut) {
        let store = await this.storeService.get(employee.workingStatus.storeId);
        toast.setMessage(`You already logged in to Store '${store.name}'. Please clock out first from there and then clock back in here.`);
        toast.present();
        return null;
      }

      return employee;
    });

    if (this.employee == null) {
      await loader.dismiss();
      return false;
    }

    loader.dismiss();
    return true;
  }

  /**
   * After Enter
   */
  async ionViewDidEnter() {

    if (!this.syncContext.currentPos.status) {
      return;
    }

    let loader = this.loading.create({
      content: 'Please Wait...',
    });


    await loader.present();

    let clockInBtn: any = {
      next: WorkingStatusEnum.ClockedIn,
      enabled: true,
      text: 'Clock IN',
      message: `You Clocked-IN at`
    };

    let clockOutBtn: any = {
      next: WorkingStatusEnum.ClockedOut,
      enabled: true,
      text: 'Clock OUT',
      message: 'You Clocked-OUT at'
    };

    let breakStartBtn = {
      next: WorkingStatusEnum.BreakStart,
      enabled: true,
      text: 'Break Start',
      message: 'You have started your break at'
    };

    let breakEndBtn = {
      next: WorkingStatusEnum.BreakEnd,
      enabled: true,
      text: 'Break End',
      message: 'You have ended your break at'
    };

    this.buttons = {
      [WorkingStatusEnum.ClockedIn]: [breakStartBtn, clockOutBtn],
      [WorkingStatusEnum.ClockedOut]: [clockInBtn],
      [WorkingStatusEnum.BreakStart]: [breakEndBtn, clockOutBtn],
      [WorkingStatusEnum.BreakEnd]: [breakStartBtn, clockOutBtn]
    };

    if (this.employee.workingStatus.status) {
      this.activeButtons = this.buttons[this.employee.workingStatus.status];
    } else {
      this.activeButtons = this.buttons[WorkingStatusEnum.ClockedOut];
    }

    this.dataLoaded = true;
    await loader.dismiss();
  }

  /**
   * Mark Time
   * @param button 
   * @param time 
   */
  public async markTime(button: any, time?: Date): Promise<any> {
    try {

      let utcDate = this.dateTimeService.getCurrentUTCDate().toDate();
      const type = await this.prepareAndInsertTimeStamp(utcDate, button);
      this.dismiss();
      let toast = this.toastCtrl.create({
        message: this.messagePlaceholder,
        duration: 3000
      });
      toast.present();
      this._sharedService.publish('clockInOut', {
        employee: this.employee,
        type
      });
    } catch (err) {
      throw new Error();
    }
  }

  private async prepareAndInsertTimeStamp(time: Date, button: any) {
    let promises = [];
    let newTimestamp: EmployeeTimestamp = new EmployeeTimestamp();
    newTimestamp.employeeId = this.employee._id;
    newTimestamp.storeId = this.syncContext.currentStore._id;
    newTimestamp.time = time;
    newTimestamp.createdAtLocalDate = moment(time).format();
    newTimestamp.type = this.mappingTimestamp[button.next];

    if (button.next == WorkingStatusEnum.ClockedOut && this.employee.workingStatus.status === WorkingStatusEnum.BreakStart) {
      let breakEnd = new EmployeeTimestamp();
      breakEnd.employeeId = this.employee._id;
      breakEnd.storeId = this.syncContext.currentStore._id;
      breakEnd.time = time;
      breakEnd.createdAtLocalDate = moment(time).format();
      breakEnd.type = EmployeeTimestampService.BREAK_END;
      promises.push(this.employeeTimestampService.add(breakEnd));
    }

    this.employee.workingStatus.status = button.next;
    this.employee.workingStatus.posId = this.syncContext.currentPos.id;
    this.employee.workingStatus.storeId = this.syncContext.currentStore._id;
    this.employee.workingStatus.time = time;
    this.employee.workingStatus.createdAtLocalDate = moment(time).format();

    promises.push(this.employeeTimestampService.add(newTimestamp));
    promises.push(this.employeeService.update(this.employee));
    await Promise.all(promises);
    return newTimestamp.type;
  }

  public dismiss(data?: any) {
    this.viewCtrl.dismiss(data || null);
  }
}