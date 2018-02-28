import _ from 'lodash';
import { Employee } from './../../model/employee';
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
import { POS } from '../../model/pos';
import { StoreService } from '../../services/storeService';
import { Store } from '../../model/store';
import { SyncContext } from "../../services/SyncContext";

@PageModule(() => SalesModule)
@Component({
  selector: 'clock-in-out',
  templateUrl: 'clock-in-out.html',
  styleUrls: ['/pages/clock-in-out/clock-in-out.scss']
})
export class ClockInOutPage {

  public employee: Employee = null;
  public posStatus: boolean;
  public posName: string;
  public pos: POS;
  public dataLoaded: boolean = false;
  public timestamp: EmployeeTimestamp;
  public buttons: any;
  public activeButtons: Array<any> = [];
  public messagePlaceholder: string = "";
  public clock: Observable<Date> = Observable
    .interval(1000)
    .map(() => new Date());
  private previousTimestamp: EmployeeTimestamp;

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
    private syncContext: SyncContext
  ) { }

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

      let toast = this.toastCtrl.create({duration: 3000});

      if (!employee) {
        toast.setMessage('Invalid PIN!');
        toast.present();
        return null;
      }

      if(!employee.isActive) {
        toast.setMessage('Employee not Active!');
        toast.present();
        return null;
      }

      var employeeClockedInToOtherStore = await this.employeeClockedInToOtherStore(this.syncContext.currentPos.storeId, employee._id);

      if (employeeClockedInToOtherStore) {
        let toast = this.toastCtrl.create({
          message: `You already logged in to Store '${employeeClockedInToOtherStore.name}'. Please clock out first from there and then clock back in here.`,
          duration: 3000
        }).present();
        
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

  private async employeeClockedInToOtherStore(currentStoreId: string, employeeId: string): Promise<Store> {
    var allStoresExceptCurrent = _.reject(await this.storeService.getAll(), ["_id", currentStoreId]);
    for (let otherStore of allStoresExceptCurrent) {
      var employeesOtherStore = await this.employeeService.getClockedInEmployeesOfStore(otherStore._id);
      if (_.find(employeesOtherStore, ["_id", employeeId])) {
        return otherStore;
      }
    }
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
      next: EmployeeTimestampService.CLOCK_IN,
      enabled: true,
      text: 'Clock IN',
      message: `You Clocked-IN at`
    };

    let clockOutBtn: any = {
      next: EmployeeTimestampService.CLOCK_OUT,
      enabled: true,
      text: 'Clock OUT',
      message: 'You Clocked-OUT at'
    };

    let breakStartBtn = {
      next: EmployeeTimestampService.BREAK_START,
      enabled: true,
      text: 'Break Start',
      message: 'You have started your break at'
    };

    let breakEndBtn = {
      next: EmployeeTimestampService.BREAK_END,
      enabled: true,
      text: 'Break End',
      message: 'You have ended your break at'
    };

    this.buttons = {
      [EmployeeTimestampService.CLOCK_IN]: [breakStartBtn, clockOutBtn],
      [EmployeeTimestampService.CLOCK_OUT]: [clockInBtn],
      [EmployeeTimestampService.BREAK_START]: [breakEndBtn, clockOutBtn],
      [EmployeeTimestampService.BREAK_END]: [breakStartBtn, clockOutBtn]
    };

    this.zone.runOutsideAngular(async () => {


      let result = await this.employeeTimestampService
        .getEmployeeLastTwoTimestamps(this.employee._id, this.syncContext.currentStore._id);

      if (result) {
        result.beforeLatest && (this.previousTimestamp = <EmployeeTimestamp>result.beforeLatest);
        this.timestamp = <EmployeeTimestamp>result.latest;
        this.activeButtons = this.buttons[this.timestamp.type];

      } else {
        this.timestamp = new EmployeeTimestamp();
        this.timestamp.employeeId = this.employee._id;
        this.timestamp.storeId = this.syncContext.currentStore._id;
        this.activeButtons = this.buttons[EmployeeTimestampService.CLOCK_OUT];
      }
    });
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
      await this.prepareAndInsertTimeStamp(time, button);
      this.dismiss();
      let toast = this.toastCtrl.create({
        message: this.messagePlaceholder,
        duration: 3000
      });
      toast.present();
      this._sharedService.publish('clockInOut', {
        employee: this.employee,
        type: this.timestamp.type
      });
    } catch (err) {
      throw new Error();
    }
  }

  private async prepareAndInsertTimeStamp(time: Date, button: any) {
    time = time || new Date();
    this.timestamp.type = button.next;
    this.timestamp.time = time;

    if (!this.timestamp.hasOwnProperty('_rev')) {
      // is new
      this.timestamp = await this.employeeTimestampService.add(this.timestamp);
    }
    else {
      // is existing
      let newTimestamp: EmployeeTimestamp;
      if (button.next == EmployeeTimestampService.CLOCK_OUT && this.previousTimestamp && this.previousTimestamp.type == EmployeeTimestampService.BREAK_START) {
        let breakEnd = new EmployeeTimestamp();
        breakEnd.employeeId = this.employee._id;
        breakEnd.storeId = this.syncContext.currentStore._id;
        breakEnd.time = time;
        breakEnd.type = EmployeeTimestampService.BREAK_END;
        await this.employeeTimestampService.add(breakEnd);
      }

      newTimestamp = _.cloneDeep(this.timestamp);
      newTimestamp._id = "";
      newTimestamp._rev = "";
      await this.employeeTimestampService.add(newTimestamp);
    }
  }

  public dismiss(data?: any) {
    this.viewCtrl.dismiss(data || null);
  }
}