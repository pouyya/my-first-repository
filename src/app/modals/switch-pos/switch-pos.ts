import _ from 'lodash';
import { POS } from './../../../model/pos';
import { PosService } from './../../../services/posService';
import { StoreService } from './../../../services/storeService';
import { Store } from './../../../model/store';
import { ViewController, LoadingController } from 'ionic-angular';
import { Component } from '@angular/core';
import { GlobalConstants } from './../../../metadata/globalConstants';
import { UserSession } from '../../../modules/dataSync/model/UserSession';
import { UserService } from '../../../modules/dataSync/services/userService';
import { SharedService } from "../../../services/_sharedService";

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
  private user: UserSession;

  constructor(
    private viewCtrl: ViewController,
    private storeService: StoreService,
    private posService: PosService,
    private loading: LoadingController,
    private userService: UserService,
    private _sharedService: SharedService
  ) {
  }

  ionViewDidEnter() {
    let loader = this.loading.create({
      content: 'Loading Stores...',
    });

    loader.present().then(async () => {
      this.user = await this.userService.getUser();
      this.posId = this.user.currentPos;
      this.storeId = this.user.currentStore;

      let stores = await this.storeService.getAll();
      var allPos = await this.posService.getAll();
      stores.forEach((store: Store) => {
        var registers = _.filter(allPos, (pos) => pos.storeId === store._id);
        if (registers.length > 0) {
          this.stores.push({ ...store, registers });
          if (store._id === this.user.currentStore) {
            this.currentStore = { ...store, registers };
          }
        }
      });
      loader.dismiss();
    });
  }

  public selectStore(storeId, index) {
    this.storeId = storeId;
    this.currentStore = { ...this.stores[index] };
  }

  public switchRegister(register: POS) {
    this.user.currentStore = register.storeId;
    this.user.currentPos = register._id;
    this._sharedService.publish('storeOrPosChanged', { currentStore: this.currentStore, currentPos: register});
    let currentPos = _.pick(register, GlobalConstants.POS_SESSION_PROPS);
    let currentStore = _.pick(this.stores.find((store) => store._id == register.storeId), GlobalConstants.STORE_SESSION_PROPS);
    this.userService.setSession(this.user);
    this.viewCtrl.dismiss({ currentStore, currentPos });
  }

  public dismiss() {
    this.viewCtrl.dismiss();
  }
}