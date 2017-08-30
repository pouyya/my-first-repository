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
import { Observable } from 'rxjs/Rx';

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
  public activeButtons: any;
  public clock: Observable<Date> = Observable
    .interval(1000)
    .map(() => new Date());
  private user: any;

  constructor(
    private pluginService: PluginService,
    private employeeService: EmployeeService,
    private employeeTimestampService: EmployeeTimestampService,
    private toastCtrl: ToastController,
    private viewCtrl: ViewController,
    private userService: UserService,
    private loading: LoadingController
  ) {

  }

  /**
   * @AuthGuard
   */
  ionViewCanEnter(): Promise<void> {
    let toast = this.toastCtrl.create({
      message: "Invalid PIN!",
      duration: 3000
    });

    return new Promise((resolve, reject) => {
      this.pluginService.openPinPrompt('Enter PIN', 'User Authorization', [], { ok: 'OK', cancel: 'Cancel' })
        .then((pin) => {
          this.employeeService.findByPin(pin).then((employee: Employee) => {
            this.user = this.userService.getLoggedInUser();
            let index = _.findIndex(employee.store, { id: this.user.settings.currentStore });
            if (index > -1) {
              this.employee = employee;
              resolve();
            } else {
              toast.present(); reject();
            }
          }).catch(() => { toast.present(); reject(); });
        })
        .catch(() => { toast.present(); reject(); });
    })
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
      text: 'Clock IN'
    };

    let clockOutBtn: any = {
      next: EmployeeTimestampService.CLOCK_OUT,
      enabled: true,
      text: 'Clock OUT'
    };

    let breakStartBtn = {
      next: EmployeeTimestampService.BREAK_START,
      enabled: true,
      text: 'Break Start'
    };

    let breakEndBtn = {
      next: EmployeeTimestampService.BREAK_END,
      enabled: true,
      text: 'Break End'
    };

    this.buttons = {
      [EmployeeTimestampService.CLOCK_IN]: [breakStartBtn, clockOutBtn],
      [EmployeeTimestampService.CLOCK_OUT]: [clockInBtn],
      [EmployeeTimestampService.BREAK_START]: [breakEndBtn, clockOutBtn],
      [EmployeeTimestampService.BREAK_END]: [clockOutBtn]
    };

    let promises: Array<Promise<any>> = [
      this.employeeTimestampService.getEmployeeLatestTimestamp(
        this.employee._id, this.user.settings.currentStore
      )
    ];

    Promise.all(promises).then((result) => {
      let timestamp = result[0];
      if (!timestamp) {
        this.timestamp = new EmployeeTimestamp();
        this.timestamp.employeeId = this.employee._id;
        this.timestamp.storeId = this.user.settings.currentStore;
        this.activeButtons = this.buttons[EmployeeTimestampService.CLOCK_OUT];
      } else {
        this.timestamp = timestamp;
        this.activeButtons = this.buttons[this.timestamp.type];
      }
    }).catch(error => console.log(error)).then(() => loader.dismiss());
  }

  public markTime(type: string, time?: Date) {
    time = time || new Date();
    this.timestamp.type = type;
    this.timestamp.time = time;
    // this.employeeTimestampService.add(this.timestamp) /* Will Enable Later */
    this.activeButtons = this.buttons[type];
  }

  public dismiss() {
    this.viewCtrl.dismiss();
  }
}