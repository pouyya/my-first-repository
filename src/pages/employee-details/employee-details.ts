import { AppSettingsService } from './../../services/appSettingsService';
import { Employee } from './../../model/employee';
import { Store } from './../../model/store';
import { StoreService } from './../../services/storeService';
import { Component, NgZone } from "@angular/core";
import { EmployeeService } from "../../services/employeeService";
import { NavParams, Platform, NavController, AlertController, ToastController } from "ionic-angular";

@Component({
  selector: 'employee-detail',
  templateUrl: 'employee-details.html'
})
export class EmployeeDetails {

  public employee: Employee = new Employee();
  public isNew = true;
  public action = 'Add';
  public stores: Array<{ id: string, store: Store, role: string }> = [];

  constructor(private employeeService: EmployeeService,
    private zone: NgZone,
    private storeService: StoreService,
    private navParams: NavParams,
    private platform: Platform,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private appSettingsService: AppSettingsService,
    public navCtrl: NavController) {
  }

  ionViewDidLoad() {
    let currentItem = this.navParams.get('item');
    if (currentItem) {
      this.employee = currentItem;
      this.isNew = false;
      this.action = 'Edit';
    }

    this.platform.ready().then(() => {
      if (currentItem) {
        this.employeeService.getAssociatedStores(this.employee.store)
          .then(stores => {
            this.stores = stores;
          })
      } else {
        this.storeService.getAll()
          .then(data => {
            this.zone.run(() => {
              data.forEach((store, index) => {
                this.stores.push({ id: store._id, store: store, role: 'staff' });
              });
            });
          })
          .catch(console.error.bind(console));
      }
    });
  }

  public save(): void {
    let storeToSave: Array<any> = [];
    this.stores.forEach((store, index) => {
      storeToSave.push({ id: store.id, role: store.role });
    });
    this.employee.store = storeToSave;
    if (this.isNew) {
      this.employeeService.add(this.employee)
        .then(this.navCtrl.pop())
        .catch(console.error.bind(console));
    } else {
      this.employeeService.update(this.employee)
        .then(this.navCtrl.pop())
        .catch(console.error.bind(console));
    }
  }

  public remove(): void {
    this.employeeService.delete(this.employee)
      .then(this.navCtrl.pop())
      .catch(console.error.bind(console));
  }

  public changeRole(role: string, id: string) {
    this.stores.forEach((store, index) => {
      if (store.id === id) {
        this.stores[index].role = role;
      }
    });
  }

  public setPin() {
    let pin1: number = 0;
    let pin2: number = 0;
    let config: any = {
      input: [{
        name: 'pin',
        placeholder: 'xxxx',
        type: 'number'
      }]
    };

    let enterPin = () => {
      let prompt = this.alertCtrl.create({
        title: 'Enter PIN',
        inputs: config.input,
        buttons: ['Cancel', {
          text: 'OK',
          handler: (data: any) => {
            // check for validity
            let checkers: Array<Promise<any>> = [
              new Promise((resolve, reject) => {
                let exp: RegExp = /([a-zA-Z0-9])\1{2,}/;
                exp.test(data.pin) ? reject("PIN have duplicate entries") : resolve();
              }),
              new Promise((resolve, reject) => {
                this.appSettingsService.matchFromReservedPins(data.pin).then((item: Array<any>) => {
                  item.length > 0 ? reject("PIN already exists in the system. Choose another one.") : resolve();
                }).catch(() => resolve());
              })
            ];

            Promise.all(checkers).then(() => {
              pin1 = Number(data.pin);
              confirmPin();
            }).catch((error) => {
              let toast = this.toastCtrl.create({
                message: error,
                duration: 3000
              });
              toast.present();
              return false;
            });
          }
        }]
      });
      prompt.present();
    }

    let confirmPin = () => {
      let prompt = this.alertCtrl.create({
        title: 'Confirm PIN',
        inputs: config.input,
        buttons: ['Cancel', {
          text: 'OK',
          handler: (data: any) => {
            pin2 = Number(data.pin);
            if (pin1 === pin2) {
              this.employee.pin = pin2;
            } else {
              let toast = this.toastCtrl.create({
                message: "PIN doesn't match",
                duration: 3000
              });
              toast.present();
              return false;
            }
          }
        }]
      });
      prompt.present();
    }

    // if user has pin then verify that pin first
    if (this.employee.pin) {
      let prompt = this.alertCtrl.create({
        title: 'Verify PIN',
        inputs: [
          {
            name: 'pin',
            placeholder: 'xxxx',
            type: 'number'
          },
        ],
        buttons: [
          'Cancel',
          {
            text: 'OK',
            handler: (data: any) => {
              if (Number(data.pin) === this.employee.pin) {
                enterPin();
              } else {
                let toast = this.toastCtrl.create({
                  message: "Incorrect PIN",
                  duration: 3000
                });
                toast.present();
              }
            }
          }
        ]
      });
      prompt.present();
    } else {
      enterPin();
    }
  }
}