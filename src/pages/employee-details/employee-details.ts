import _ from 'lodash';
import { SelectRolesModal } from './modals/select-roles/select-roles';
import { EmployeeTimestampService } from './../../services/employeeTimestampService';
import { reservedPins } from './../../metadata/reservedPins';
import { PluginService } from './../../services/pluginService';
import { Employee, RolesInterface } from './../../model/employee';
import { StoreService } from './../../services/storeService';
import { Component, NgZone, ChangeDetectorRef } from "@angular/core";
import { EmployeeService } from "../../services/employeeService";
import { SecurityGuard } from '../../metadata/securityGuardModule';
import { EmployeeDetailsPageRoleModule } from './../../modules/roles/employeeDetailsPageRoleModule';
import {
  NavParams,
  NavController,
  ToastController,
  ModalController,
  LoadingController
} from "ionic-angular";

@SecurityGuard(() => EmployeeDetailsPageRoleModule)
@Component({
  selector: 'employee-detail',
  templateUrl: 'employee-details.html',
  styleUrls: ['/pages/employee-details/employee-details.scss']
})
export class EmployeeDetails {

  public employee: Employee = new Employee();
  public isNew = true;
  public action = 'Add';
  public stores: any[] = [];
  public roles: string[] = [
    'BackOffice',
    'Products',
    'ProductDetails',
    'Services',
    'ServiceDetails',
    'Employees',
    'EmployeeDetails',
    'Stores',
    'StoreDetails',
    'Settings'
  ];

  constructor(
    private employeeService: EmployeeService,
    private timestampService: EmployeeTimestampService,
    private zone: NgZone,
    private storeService: StoreService,
    private cdr: ChangeDetectorRef,
    private navParams: NavParams,
    private toastCtrl: ToastController,
    private pluginService: PluginService,
    private modalCtrl: ModalController,
    private loading: LoadingController,
    private navCtrl: NavController) {
  }

  async ionViewDidLoad() {
    let loader = this.loading.create({content: 'Loading Details...'});

    await loader.present();
    this.cdr.detach();
    let stores = await this.storeService.getAll();
    this.stores = stores.map(store => {
      return {
        ...store,
        selected: false,
        roles: this.roles.map(role => {
          return {
            name: role,
            selected: false
          }
        })
      };
    });

    let currentItem = this.navParams.get('item');
    if (currentItem) {
      this.employee = currentItem;
      this.isNew = false;
      this.action = 'Edit';
      this.stores = this.stores.map(store => {
        let index = _.findIndex(this.employee.store, { id: store._id });
        if (index > -1) {
          store.selected = true;
          let roles = this.employee.store[index].roles;
          if (roles && roles.length > 0) {
            store.roles = store.roles.map(role => {
              if (roles.indexOf(role.name) > -1) {
                role.selected = true;
              }
              return role;
            });
          }
        }

        return store;
      });
    }

    this.cdr.reattach();
    loader.dismiss();
  }

  public async save(): Promise<any> {
    try {
      this.employee.store = _.filter(this.stores, { selected: true })
        .map((store: any) => {
          store.roles = _.filter(store.roles, { selected: true })
            .map((role: any) => role.name);
          return <RolesInterface> {
            id: store._id,
            roles: store.roles
          };
        });

      await this.employeeService[this.isNew ? 'add' : 'update'](this.employee);
      this.navCtrl.pop();
      return;
    } catch (err) {
      throw new Error(err);
    }
  }

  public async remove(): Promise<any> {
    try {
      // delete employee associations
      await this.timestampService.getEmployeeTimestamps(this.employee._id);
      await this.employeeService.delete(this.employee);
      this.navCtrl.pop();
      return;
    } catch (err) {
      throw new Error(err);
    }
  }

  public selectRoles(store, index: number) {
    let modal = this.modalCtrl.create(SelectRolesModal, { store, index });
    modal.present();
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
    };

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