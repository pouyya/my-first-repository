import _ from 'lodash';
import { Employee } from './../../model/employee';
import { EmployeeService } from './../../services/employeeService';
import { Component } from '@angular/core';
import {
  AlertController, LoadingController, ModalController, NavController, NavParams,
  ToastController
} from 'ionic-angular';
import { StoreService } from "../../services/storeService";
import { Store, POS, Device, DeviceType } from './../../model/store';
import { ResourceService } from '../../services/resourceService';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from './../../model/securityAccessRightRepo';
import { DeviceDetailsModal } from "./modals/device-details";
import { PosDetailsModal } from "./modals/pos-details";

@SecurityModule(SecurityAccessRightRepo.StoreAddEdit)
@Component({
  templateUrl: 'store-details.html'
})
export class StoreDetailsPage {
  public item: Store = new Store();
  public isNew: boolean = true;
  public action: string = 'Add';
  public devices: Device[] = [];
  public countries: Array<any> = [];
  public posToAdd: POS[] = [];
  public deviceType = DeviceType;

  constructor(private navCtrl: NavController,
    private navParams: NavParams,
    private modalCtrl: ModalController,
    private storeService: StoreService,
    private employeeService: EmployeeService,
    private loading: LoadingController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private resourceService: ResourceService) {
  }

  async ionViewDidEnter() {
    let loader = this.loading.create({
      content: 'Loading Store...'
    });
    let store = this.navParams.get('store');
    if (store) {
        this.item = store;
        this.isNew = false;
        this.action = 'Edit';
    }

    await loader.present();
    this.countries = await this.resourceService.getCountries();
    await loader.dismiss();
  }

  private async addPos(store: Store) { //
    if (this.posToAdd.length > 0) {
      const pos: POS[] = this.posToAdd; //delete?
      store.POS = store.POS
    }
    return;
  };

  public async onSubmitAndReturn(isReturn) {
    let loader = this.loading.create({ content: 'Saving store...' });

    await loader.present();
    if (this.isNew) {
      await this.storeService.add(this.item);
    } else {
      await this.storeService.update(this.item);
    }
    loader.dismiss();

    if (isReturn == true)
      this.navCtrl.pop();
  }

  public showPos(pos: POS, index: number) {
    const newPos = _.clone(pos);
    let modal = this.modalCtrl.create(PosDetailsModal, { pos : newPos });
    modal.onDidDismiss((data: { status: string,  pos: POS }) => {
        if (data) {
          if(data.status == "remove"){
            this.item.POS.splice(index, 1);
          } else {
              this.item.POS[index] = data.pos;
          }
        }
    });
    modal.present();
  }

  public addRegister() {
    let modal = this.modalCtrl.create(PosDetailsModal);
    modal.onDidDismiss((data: { status: string, pos: POS }) => {
        if (data && data.status === "add") {
            !this.item.POS && (this.item.POS = []);
            this.item.POS.push(data.pos);
        }
    });
    modal.present();
  }

  public removeAddedRegister(index: number) {
    this.item.POS.splice(index, 1);
  }


  // Device
  public showDevice(device: Device, index: number) {
    let modal = this.modalCtrl.create(DeviceDetailsModal, { device });
    modal.onDidDismiss((data: { status: string, device: Device }) => {
      if (data && data.status == "remove") {
        this.item.devices.splice(index, 1);
      }
    });
    modal.present();
  }

  public addDevice() {
    let modal = this.modalCtrl.create(DeviceDetailsModal);
    modal.onDidDismiss((data: { status: string, device: Device }) => {
      if (data && data.status === "add") {
        !this.item.devices && (this.item.devices = []);
        this.item.devices.push(data.device);
      }
    });
    modal.present();
  }

  public async removeDevice(index: number) {
    let confirm = this.alertCtrl.create({
      title: 'Are you sure you want to delete this Device ?',
      message: 'Deleting this device!',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            let loader = this.loading.create({
              content: 'Deleting. Please Wait!',
            });

            loader.present().then(() => {
              this.item.devices.splice(index, 1);
              let toast = this.toastCtrl.create({
                message: 'Device has been deleted successfully',
                duration: 3000
              });
              toast.present();
              loader.dismiss();
            });
          }
        }, 'No'
      ]
    });
    confirm.present();
  }

  // Device
  public remove() {
    let confirm = this.alertCtrl.create({
      title: 'Are you sure you want to delete this store ?',
      message: 'Deleting this store, will delete all associated Registers, Sales and any Current Sale!',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            let loader = this.loading.create({
              content: 'Deleting. Please Wait!',
            });

            loader.present().then(() => {
              this.storeService.delete(this.item, true /* Delete all Associations */).then(() => {
                // delete employee associations
                this.employeeService.findByStore(this.item._id).then((employees: Employee[]) => {
                  if (employees.length > 0) {
                    employees.forEach((employee, index, arr) => {
                      let storeIndex: number = _.findIndex(employee.store, (currentStore) => currentStore.id == this.item._id);
                      arr[index].store.splice(storeIndex, 1);
                    });
                    this.employeeService.updateBulk(employees).then(() => {
                      let toast = this.toastCtrl.create({
                        message: 'Store has been deleted successfully',
                        duration: 3000
                      });
                      toast.present();
                      this.navCtrl.pop();
                    }).catch(error => {
                      throw new Error(error);
                    })
                  } else {
                    let toast = this.toastCtrl.create({
                      message: 'Store has been deleted successfully',
                      duration: 3000
                    });
                    toast.present();
                    this.navCtrl.pop();
                  }
                }).catch(error => {
                  throw new Error(error);
                });
              }).catch(error => {
                let errorMsg = error.hasOwnProperty('error_msg') ? error.error_msg : 'Error while deleting store. Please try again!';
                let alert = this.alertCtrl.create({
                  title: 'Error',
                  subTitle: errorMsg,
                  buttons: ['OK']
                });
                alert.present();
              }).then(() => loader.dismiss());
            });
          }
        }, 'No'
      ]
    });

    confirm.present();
  }
}
