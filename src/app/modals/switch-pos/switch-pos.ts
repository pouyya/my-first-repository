import { User } from './../../../model/user';
import { UserService } from './../../../services/userService';
import { POS } from './../../../model/pos';
import { PosService } from './../../../services/posService';
import { StoreService } from './../../../services/storeService';
import { Store } from './../../../model/store';
import { ViewController, Platform, LoadingController, NavParams} from 'ionic-angular';
import { Component } from '@angular/core';
@Component({
  selector: "switch-pos",
  templateUrl: "switch-pos.html"
})
export class SwitchPosModal {

  public stores: Array<any> = [];
  public storeId: string;
  public currentStore: any;
  public user: User;

  constructor(
    private viewCtrl: ViewController,
    private platform: Platform,
    private storeService: StoreService,
    private posService: PosService,
    private loading: LoadingController,
    private navParams: NavParams,
    private userService: UserService
  ) {
      this.currentStore = navParams.get('store');
      this.storeId = this.currentStore._id;
  }

  ionViewDidEnter() {
    let loader = this.loading.create({
      content: 'Loading Stores...',
    });

    loader.present().then(() => {

      this.storeService.getAll().then((stores: Array<Store>) => {
        var storePromises: Array<Promise<any>> = [];
        stores.forEach((store, index) => {
          storePromises.push(new Promise((resolve, reject) => {
            this.posService.findBy({ selector: { storeId: store._id } }).then((registers: Array<POS>) => {
              if(registers.length > 0) {
                this.stores.push({ ...store, registers });
              }
              resolve();
            }).catch((error) => {
              reject(error);
            });
          }));
        });

        Promise.all(storePromises).then(() => {
          this.userService.getLoggedInUser().then((user) => {
            this.user = user;
          }).catch((error) => {
            throw new Error(error);
          })
          loader.dismiss()
        })
        .catch((error) => {
          throw new Error(error);
        })

      }).catch((error) => {
        throw new Error(error);
      });      
    });
  }

  public selectStore(storeId, index) {
    this.storeId = storeId;
    this.currentStore = { ...this.stores[index] };
  }

  public switchRegister(register: POS) {
    this.user.currentStore = register.storeId;
    this.user.currentPos = register._id;
    this.userService.update(this.user).then(() => {
      this.viewCtrl.dismiss();
    }).catch((error) => {
      throw new Error(error);
    });
  }

  public dismiss() {
    this.viewCtrl.dismiss();
  }
}