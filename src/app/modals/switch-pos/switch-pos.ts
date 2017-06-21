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
    private cdr: ChangeDetectorRef
  ) {
  }

  ionViewDidEnter() {
    let loader = this.loading.create({
      content: 'Loading Stores...',
    });

    loader.present().then(() => {
      this.user = JSON.parse(localStorage.getItem('user'));
      this.posId = this.user.settings.currentPos;
      this.storeId = this.user.settings.currentStore;
      
      this.storeService.getAll().then((stores: Array<Store>) => {
        var storePromises: Array<Promise<any>> = [];
        stores.forEach((store: Store, index) => {
          storePromises.push(new Promise((resolve, reject) => {
            this.posService.findBy({ selector: { storeId: store._id } }).then((registers: Array<POS>) => {
              if (registers.length > 0) {
                this.stores.push({ ...store, registers });
                if(store._id === this.user.settings.currentStore) {
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
        }) .catch((error) => {
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
    this.user.currentPos = { ...register };
    this.user.currentStore = this.stores.find((store) => store._id == register.storeId);
    localStorage.setItem('user', JSON.stringify(this.user));
    this.viewCtrl.dismiss();
  }

  public dismiss() {
    this.viewCtrl.dismiss();
  }
}