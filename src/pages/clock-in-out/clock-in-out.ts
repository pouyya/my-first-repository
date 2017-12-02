import * as moment from 'moment'
import _ from 'lodash';
import { UserService } from './../../services/userService';
import { Employee } from './../../model/employee';
import { ToastController, ViewController, LoadingController } from 'ionic-angular';
import { EmployeeService } from './../../services/employeeService';
import { PluginService } from './../../services/pluginService';
import { Component } from '@angular/core';
import { SalesModule } from "../../modules/salesModule";
import { PageModule } from './../../metadata/pageModule';
import { EmployeeTimestampService } from './../../services/employeeTimestampService';
import { EmployeeTimestamp } from './../../model/employeeTimestamp';
import { SharedService } from './../../services/_sharedService';
import { Observable } from 'rxjs/Rx';
import { UserSession } from '../../model/UserSession';

@PageModule(() => SalesModule)
@Component({
  selector: 'clock-in-out',
  templateUrl: 'clock-in-out.html',
  styleUrls: ['/pages/clock-in-out/clock-in-out.scss']
})
export class ClockInOutPage {

  public employee: Employee;
  public timestamp: EmployeeTimestamp;
  public buttons: any;
  public activeButtons: Array<any> = [];
  public messagePlaceholder: string = "";
  public clock: Observable<Date> = Observable
    .interval(1000)
    .map(() => new Date());
  private user: UserSession;
  private previousTimestamp: EmployeeTimestamp;

  constructor(
    private _sharedService: SharedService,
    private pluginService: PluginService,
    private employeeService: EmployeeService,
    private employeeTimestampService: EmployeeTimestampService,
    private toastCtrl: ToastController,
    private viewCtrl: ViewController,
    private userService: UserService,
    private loading: LoadingController
  ) { }

  /**
   * @AuthGuard
   */
  async ionViewCanEnter(): Promise<boolean> {
    let pin = await this.pluginService.openPinPrompt('Enter PIN', 'User Authorization', [],
      { ok: 'OK', cancel: 'Cancel' });
    if (pin) {
      let employee: Employee = await this.employeeService.findByPin(pin);
      if (employee) {
        this.user = this.userService.getLoggedInUser();
        this.employee = employee;
        return true;
      }
      else {
        let toast = this.toastCtrl.create({
          message: "Invalid PIN!",
          duration: 3000
        });
            
        toast.present();

        return false;
      }
    }
  }

  /**
   * After Enter
   */
  ionViewDidEnter() {
    let loader = this.loading.create({
      content: 'Please Wait...',
    });

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

    let promises: Array<Promise<any>> = [
      this.employeeTimestampService.getEmployeeLastTwoTimestamps(
        this.employee._id, this.user.currentStore
      )
    ];

    Promise.all(promises).then((result) => {
      if (result[0]) {
        result[0].beforeLatest && (this.previousTimestamp = result[0].beforeLatest);
        this.timestamp = result[0].latest as EmployeeTimestamp;
        if (this.timestamp.type == EmployeeTimestampService.CLOCK_OUT) {
          // check if shift is not ended yet
          let currentDate = new Date();
          let clockoutTime = new Date(this.timestamp.time);
          if (moment(moment(currentDate).format('YYYY-MM-DD')).isSame(moment(clockoutTime).format('YYYY-MM-DD'))) {
            this.employeeTimestampService.getEmployeeLatestTimestamp(
              this.employee._id, this.user.currentStore, EmployeeTimestampService.CLOCK_IN
            ).then((model: EmployeeTimestamp) => {
              let clockInTime = "";
              clockInBtn.enabled = false;
              this.messagePlaceholder = `You already clocked in at ${clockInTime} and you can't clock in for today`;
              this.activeButtons = this.buttons[EmployeeTimestampService.CLOCK_OUT];
            }).catch(error => {
              throw new Error(error)
            });
          } else {
            this.activeButtons = this.buttons[this.timestamp.type];
          }
        } else {
          this.activeButtons = this.buttons[this.timestamp.type];
        }
      } else {
        this.timestamp = new EmployeeTimestamp();
        this.timestamp.employeeId = this.employee._id;
        this.timestamp.storeId = this.user.currentStore;
        this.activeButtons = this.buttons[EmployeeTimestampService.CLOCK_OUT];
      }
    }).catch(error => console.log(error)).then(() => loader.dismiss());
  }

  /**
   * Mark Time
   * @param button 
   * @param time 
   */
  public markTime(button: any, time?: Date): void {
    let completionPromise = new Promise((resolve, reject) => {
      time = time || new Date();

      this.timestamp.type = button.next;
      this.timestamp.time = time;
      this.activeButtons = this.buttons[button.next];

      if (!this.timestamp.hasOwnProperty('_rev')) {
        // is new
        this.employeeTimestampService.add(this.timestamp).then((response: any) => {
          this.employeeTimestampService.get(response.id).then((timestamp) => {
            this.timestamp = timestamp;
            this.messagePlaceholder = `${button.message} ${time}`;
          }).catch(error => reject(error)).then(() => resolve(this.timestamp.type));
        }).catch(error => reject(error));
      } else {
        // is existing
        let newTimestamp: EmployeeTimestamp;
        if (button.next == EmployeeTimestampService.CLOCK_OUT) {
          let promises: Promise<any>[] = [];
          if (this.previousTimestamp && this.previousTimestamp.type == EmployeeTimestampService.BREAK_START) {
            let breakEnd = new EmployeeTimestamp();
            breakEnd.employeeId = this.employee._id;
            breakEnd.storeId = this.user.currentStore;
            breakEnd.time = time;
            breakEnd.type = EmployeeTimestampService.BREAK_END;
            promises.push(this.employeeTimestampService.add(breakEnd));
          }
          newTimestamp = _.cloneDeep(this.timestamp);
          newTimestamp._id = "";
          newTimestamp._rev = "";
          promises.push(this.employeeTimestampService.add(newTimestamp));
          Promise.all(promises).then(() => {
            let currentDate = new Date();
            let clockoutTime = new Date(this.timestamp.time);
            if (moment(moment(currentDate).format('YYYY-MM-DD')).isSame(moment(clockoutTime).format('YYYY-MM-DD'))) {
              this.employeeTimestampService.getEmployeeLatestTimestamp(
                this.employee._id, this.user.currentStore, EmployeeTimestampService.CLOCK_IN
              ).then((model: EmployeeTimestamp) => {
                let clockInTime = "";
                this.buttons[EmployeeTimestampService.CLOCK_OUT][0].enabled = false;
                this.messagePlaceholder = `You already clocked in at ${clockInTime} and you can't clock in for today`;
              }).catch(error => reject(error)).then(() => {
                this.activeButtons = this.buttons[EmployeeTimestampService.CLOCK_OUT];
                resolve(this.timestamp.type);
              });
            } else {
              this.messagePlaceholder = `${button.message} ${time}`;
            }
          }).catch(error => reject(error)).then(() => resolve(this.timestamp.type));
        } else {
          newTimestamp = _.cloneDeep(this.timestamp);
          newTimestamp._id = "";
          newTimestamp._rev = "";
          this.employeeTimestampService.add(newTimestamp).then(() => {
            this.messagePlaceholder = `${button.message} ${time}`;
            this.activeButtons = this.buttons[button.next];
          }).catch(error => reject(error)).then(() => resolve(this.timestamp.type));
        }
      }
    });

    completionPromise.then((type) => {
      this.dismiss();
      let toast = this.toastCtrl.create({
        message: this.messagePlaceholder,
        duration: 3000
      });
      toast.present();
      this._sharedService.publish({
        employee: this.employee,
        type
      });
    }).catch(error => {
      throw new Error();
    })
  }

  public dismiss(data?: any) {
    this.viewCtrl.dismiss(data || null);
  }
}