import _ from 'lodash';
import { POS } from './../../../model/store';
// import { PosService } from './../../../services/posService';
import { StoreService } from './../../../services/storeService';
import { Store } from './../../../model/store';
import { ViewController, LoadingController } from 'ionic-angular';
import { Component } from '@angular/core';
import { GlobalConstants } from './../../../metadata/globalConstants';
import { UserSession } from '../../../modules/dataSync/model/UserSession';
import { UserService } from '../../../modules/dataSync/services/userService';
import { SharedService } from "../../../services/_sharedService";
import { SecurityAccessRightRepo } from "../../../model/securityAccessRightRepo";
import { SecurityModule } from "../../../infra/security/securityModule";
import { SyncContext } from '../../../services/SyncContext';

@SecurityModule(SecurityAccessRightRepo.SwitchPos, false)
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

  constructor(
    private viewCtrl: ViewController,
    private storeService: StoreService,
    private loading: LoadingController,
    private userService: UserService,
    private _sharedService: SharedService,
    private syncContext: SyncContext
  ) {
  }

  async ionViewDidEnter() {

    let loader = this.loading.create({
      content: 'Loading Stores...',
    });

    await loader.present();

    this.posId = this.syncContext.currentPos._id;
    this.storeId = this.syncContext.currentStore._id;

    let stores = await this.storeService.getAll();
    // Promise.all([this.storeService.getAll(), this.posService.getAll()]);

    stores.some((store: Store) => {
      // var registers = _.filter(allPos, (pos) => pos.storeId === store._id);
      if (store.POS.length > 0) {
        // this.stores.push({ ...store, registers });
        if (store._id === this.storeId) {
          this.currentStore = store;
          return true;
        }
      }
    });
    await loader.dismiss();
  }

  public selectStore(storeId, index) {
    this.storeId = storeId;
    this.currentStore = { ...this.stores[index] };
  }

  public async switchRegister(register: POS, storeId: string) {
    var user = await this.userService.getUser();
    user.currentStore = storeId;
    user.currentPos = register._id;
    this._sharedService.publish('storeOrPosChanged', { currentStore: this.currentStore, currentPos: register });
    let currentPos = _.pick(register, GlobalConstants.POS_SESSION_PROPS);
    let currentStore = _.pick(this.stores.find((store) => store._id == storeId), GlobalConstants.STORE_SESSION_PROPS);
    this.userService.setSession(user);
    this.viewCtrl.dismiss({ currentStore, currentPos });
  }

  public dismiss() {
    this.viewCtrl.dismiss();
  }
}