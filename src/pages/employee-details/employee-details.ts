import _ from 'lodash';
import { Store } from './../../model/store';
import { SecurityAccessRightRepo } from './../../model/securityAccessRightRepo';
import { SelectRolesModal } from './modals/select-roles/select-roles';
import { reservedPins } from './../../metadata/reservedPins';
import { PluginService } from './../../services/pluginService';
import { Employee, EmployeeRolePerStore } from './../../model/employee';
import { StoreService } from './../../services/storeService';
import { Component, ChangeDetectorRef } from "@angular/core";
import { EmployeeService } from "../../services/employeeService";
import {
  NavParams,
  NavController,
  ToastController,
  ModalController,
  LoadingController
} from "ionic-angular";
import { SecurityModule } from '../../infra/security/securityModule';
import { Utilities } from "../../utility";

interface SelectableStore extends Store {
  selected: boolean;
  role: string;
}

@SecurityModule(SecurityAccessRightRepo.EmployeeAddEdit)
@Component({
  selector: 'employee-details',
  templateUrl: 'employee-details.html'
})
export class EmployeeDetails {

  public employee: Employee = new Employee();
  public isNew = true;
  public action = 'Add';
  public stores: SelectableStore[] = [];

  constructor(
    private employeeService: EmployeeService,
    private storeService: StoreService,
    private cdr: ChangeDetectorRef,
    private navParams: NavParams,
    private toastCtrl: ToastController,
    private pluginService: PluginService,
    private modalCtrl: ModalController,
    private loading: LoadingController,
    private navCtrl: NavController,
    private utility: Utilities) {
  }

  async ionViewDidLoad() {
    let loader = this.loading.create();

    await loader.present();
    this.cdr.detach();
    this.stores = (await this.storeService.getAll()).map(store => {
      return <SelectableStore>{
        ...store,
        selected: false,
        role: null
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
          store.role = this.employee.store[index].role || null;
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
        .map(store => {
          return <EmployeeRolePerStore>{
            id: store._id,
            role: store.role
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
      const deleteItem = await this.utility.confirmRemoveItem("Do you really want to delete this employee!");
      if (!deleteItem) {
        return;
      }
      await this.employeeService.delete(this.employee);
      this.navCtrl.pop();
      return;
    } catch (err) {
      throw new Error(err);
    }
  }

  public selectRoles(store: SelectableStore, index: number) {
    let modal = this.modalCtrl.create(SelectRolesModal, { store });
    modal.onDidDismiss((res) => {
      if (store.selected && res && res.selectedRole) {
        store.role = res.selectedRole;
      }
    });
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

    this.pluginService.openPinPrompt('Enter PIN', 'Enter Your PIN', config.inputs, config.buttons).then((pin1: number) => {
      let validators: Array<Promise<any>> = [
        new Promise((resolve, reject) => {
          let exp: RegExp = /([a-zA-Z0-9])\1{2,}/;
          exp.test(pin1.toString()) ? reject("Choose another PIN, we need a strong PIN, please try again!") : resolve();
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
          duration: 4000
        });
        toast.present();
      });

    }).catch(() => {
      console.error("There was en error");
    });
  }
}