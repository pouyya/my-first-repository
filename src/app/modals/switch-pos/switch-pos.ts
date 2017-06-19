import { UserSettings } from './../../../model/userSettings';
import { UserSettingsService } from './../../../services/userSettingsService';
import { POS } from './../../../model/pos';
import { PosService } from './../../../services/posService';
import { StoreService } from './../../../services/storeService';
import { Store } from './../../../model/store';
import { ViewController, Platform, LoadingController, NavParams } from 'ionic-angular';
import { Component, ChangeDetectorRef } from '@angular/core';


@Component({
  selector: "switch-pos",
  templateUrl: "switch-pos.html"
})
export class SwitchPosModal {

  public stores: Array<any> = [];
  public storeId: string;
  public currentStore: any;
  public userSettings: UserSettings;

  constructor(
    private viewCtrl: ViewController,
    private platform: Platform,
    private storeService: StoreService,
    private posService: PosService,
    private loading: LoadingController,
    private navParams: NavParams,
    private userSettingsService: UserSettingsService,
    private cdr: ChangeDetectorRef
  ) {
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
              if (registers.length > 0) {
                this.stores.push({ ...store, registers });
              }
              resolve();
            }).catch((error) => {
              reject(error);
            });
          }));
        });

        Promise.all(storePromises).then(() => {
          this.userSettingsService.getSettings().then((userSettings) => {
            this.userSettings = userSettings;
            this.currentStore = this.navParams.get('store');
            this.storeId = this.currentStore._id;
            loader.dismiss();
          }).catch((error) => {
            throw new Error(error);
          })
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
    this.userSettings.currentStore = register.storeId;
    this.userSettings.currentPos = register._id;
    this.userSettingsService.update(this.userSettings).then(() => {
      this.viewCtrl.dismiss();
    }).catch((error) => {
      throw new Error(error);
    });
  }

  public dismiss() {
    this.viewCtrl.dismiss();
  }
}