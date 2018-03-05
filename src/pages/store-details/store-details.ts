import _ from 'lodash';
import { Employee } from './../../model/employee';
import { EmployeeService } from './../../services/employeeService';
import { Component } from '@angular/core';
import { AlertController, LoadingController, NavController, NavParams, ToastController } from 'ionic-angular';
import { StoreService } from "../../services/storeService";
import { Store } from './../../model/store';
import { PosDetailsPage } from './../pos-details/pos-details';
import { POS } from './../../model/pos';
import { PosService } from './../../services/posService';
import { ResourceService } from '../../services/resourceService';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from './../../model/securityAccessRightRepo';

@SecurityModule(SecurityAccessRightRepo.StoreAddEdit)
@Component({
  templateUrl: 'store-details.html',
})
export class StoreDetailsPage {
  public item: Store = new Store();
  public isNew: boolean = true;
  public action: string = 'Add';
  public registers: Array<POS> = [];
  public countries: Array<any> = [];
  public posToAdd: POS[] = [];

  constructor(private navCtrl: NavController,
    private navParams: NavParams,
    private storeService: StoreService,
    private employeeService: EmployeeService,
    private posService: PosService,
    private loading: LoadingController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private resourceService: ResourceService) {
  }

  ionViewDidEnter() {
    let loader = this.loading.create({
      content: 'Loading Store...'
    });

    loader.present().then(() => {
      let promises: Array<Promise<any>> = [
        // load store data
        new Promise((resolve, reject) => {
          let store = this.navParams.get('store');
          if (store) {
            this.item = store;
            this.isNew = false;
            this.action = 'Edit';

            // load registers/POS
            this.posService.findBy({ selector: { storeId: this.item._id } }).then((registers) => {
              if (registers && registers.length) {
                this.registers = registers;
              }
              resolve();
            }).catch((error) => {
              reject(new Error(error));
            });
          } else {
            resolve();
          }
        }),
        // load countries list
        new Promise(async (resolve, reject) => {
          this.countries = await this.resourceService.getCountries();
          resolve();
        })
      ];
      this.onSubmitAndReturn(false);
      Promise.all(promises).then(function () {
        loader.dismiss();
      });
      
    });
  }

  
 public async onSubmitAndReturn(isReturn) {
  let loader = this.loading.create({ content: 'Saving store...' });
  let addPos = async (storeId) => {
    if (this.posToAdd.length > 0) {
      let promises: any[] = [];
      this.posToAdd.forEach(pos => {
        pos.storeId = storeId;
        promises.push(async () => await this.posService.add(pos));
      });
      return await Promise.all(promises.map(p => p()));
    }
    return;
  };
  await loader.present();
  if (this.isNew) {
    let info = await this.storeService.add(this.item);
    loader.setContent('Saving Registers...');
    await addPos(info._id);
  } else {
    await this.storeService.update(this.item);
    loader.setContent('Saving Registers...');
    await addPos(this.item._id);
  }
  loader.dismiss();

  if(isReturn==true)
  this.navCtrl.pop();
}

//  async onSubmit() {
//     let loader = this.loading.create({ content: 'Saving store...' });
//     let addPos = async (storeId) => {
//       if (this.posToAdd.length > 0) {
//         let promises: any[] = [];
//         this.posToAdd.forEach(pos => {
//           pos.storeId = storeId;
//           promises.push(async () => await this.posService.add(pos));
//         });
//         return await Promise.all(promises.map(p => p()));
//       }
//       return;
//     };
//     await loader.present();
//     if (this.isNew) {
//       let info = await this.storeService.add(this.item);
//       loader.setContent('Saving Registers...');
//       await addPos(info._id);
//     } else {
//       await this.storeService.update(this.item);
//       loader.setContent('Saving Registers...');
//       await addPos(this.item._id);
//     }
//     loader.dismiss();
//     this.navCtrl.pop();
//   }

  public showPos(pos: POS) {
    this.navCtrl.push(PosDetailsPage, {
      pos: pos,
      storeId: this.item._id,
      pushCallback: null
    });
  }

  public addRegister() {
    let pushCallback = async (pos: POS) => pos && this.posToAdd.push(pos);
    this.navCtrl.push(PosDetailsPage, {
      pos: null,
      storeId: this.item._id,
      pushCallback: pushCallback
    });
  }

  public removeAddedRegister(index: number) {
    this.posToAdd.splice(index, 1);
  }

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
