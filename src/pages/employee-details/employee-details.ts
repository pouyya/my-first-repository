import { reservedPins } from './../../metadata/reservedPins';
import { PluginService } from './../../services/pluginService';
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
    private pluginService: PluginService,
    private navCtrl: NavController) {
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
    let config = {
      inputs: [{
        name: 'pin',
        placeholder: 'xxxx',
        type: 'number'
      }],
      buttons: { ok: 'OK', cancel: 'Cancel' }
    };

    let setPin: Function = () => {
      this.pluginService.openPinPrompt('Enter PIN', 'Enter Your PIN', config.inputs, config.buttons).then((pin1: number) => {
        // check for validity
        let validators: Array<Promise<any>> = [
          new Promise((resolve, reject) => {
            let exp: RegExp = /([a-zA-Z0-9])\1{2,}/;
            exp.test(pin1.toString()) ? reject("PIN have duplicate entries") : resolve();
          }),
          new Promise((resolve, reject) => {
            reservedPins.indexOf(pin1.toString()) > -1 ? reject("This PIN is reserved for the System, please choose another") : resolve();
          }),
          new Promise((resolve, reject) => {
            this.employeeService.verifyPin(pin1).then((status) => status ? resolve() : reject("This PIN has already been in use!"))
            .catch(error => reject(error));
          })
        ];

        Promise.all(validators).then(() => {
          this.pluginService.openPinPrompt("Confirm PIN", "Re-enter Your PIN", config.inputs, config.buttons).then((pin2: number) => {
            if (pin1 === pin2) {
              this.employee.pin = pin2;
            } else {
              let toast = this.toastCtrl.create({
                message: "PIN doesn't match",
                duration: 3000
              });
              toast.present();
            }
          })
        }).catch((error) => {
          let toast = this.toastCtrl.create({
            message: error,
            duration: 3000
          });
          toast.present();
        });

      }).catch(() => {
        console.error("There was en error");
      });
    }

    if (this.employee.pin) {
      this.pluginService.openPinPrompt('Verify PIN', 'Enter Your Current PIN', config.inputs, config.buttons).then((pin) => {
          if (pin == this.employee.pin) {
            setPin();
          } else {
            let toast = this.toastCtrl.create({
              message: "Incorrect PIN",
              duration: 3000
            });
            toast.present();
          }
      })
    } else {
      setPin();
    }
  }
}