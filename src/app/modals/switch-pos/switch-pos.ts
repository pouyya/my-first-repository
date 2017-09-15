import _ from 'lodash';
import { UserService } from './../../../services/userService';
import { POS } from './../../../model/pos';
import { PosService } from './../../../services/posService';
import { StoreService } from './../../../services/storeService';
import { Store } from './../../../model/store';
import { ViewController, Platform, LoadingController, NavParams } from 'ionic-angular';
import { Component, ChangeDetectorRef } from '@angular/core';
import { GlobalConstants } from './../../../metadata/globalConstants';

@Component({
  selector: "switch-pos",
  templateUrl: "switch-pos.html"
})
export class SwitchPosModal {

  public stores: Array<any> = [];
  public storeId: string;
  public posId: string;
  public currentStore: any;
  public registers: Array<any> = [];
  private user: any;

  constructor(
    private viewCtrl: ViewController,
    private platform: Platform,
    private storeService: StoreService,
    private posService: PosService,
    private loading: LoadingController,
    private navParams: NavParams,
    private cdr: ChangeDetectorRef,
    private userService: UserService,
  ) {
  }

  ionViewDidEnter() {
    let loader = this.loading.create({
      content: 'Loading Stores...',
    });

    loader.present().then(() => {
      this.user = this.userService.getUser();
      this.posId = this.user.settings.currentPos;
      this.storeId = this.user.settings.currentStore;

      this.storeService.getAll().then((stores: Array<Store>) => {
        var storePromises: Array<Promise<any>> = [];
        stores.forEach((store: Store, index) => {
          storePromises.push(new Promise((resolve, reject) => {
            this.posService.findBy({ selector: { storeId: store._id } }).then((registers: Array<POS>) => {
              if (registers.length > 0) {
                this.stores.push({ ...store, registers });
                if (store._id === this.user.settings.currentStore) {
                  this.currentStore = { ...store, registers };
                }
              }
              resolve();
            }).catch((error) => {
              reject(error);
            });
          }));
        });

        Promise.all(storePromises).then(() => {
          loader.dismiss();
        }).catch((error) => {
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
    this.user.settings.currentStore = register.storeId;
    this.user.settings.currentPos = register._id;
    this.user.currentPos = _.pick(register, GlobalConstants.POS_SESSION_PROPS);
    this.user.currentStore = _.pick(this.stores.find((store) => store._id == register.storeId), GlobalConstants.STORE_SESSION_PROPS);
    this.userService.setSession(this.user);
    this.viewCtrl.dismiss();
  }

  public dismiss() {
    this.viewCtrl.dismiss();
  }
}