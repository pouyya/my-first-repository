import _ from 'lodash';
import { POS } from './../../../model/store';
import { StoreService } from './../../../services/storeService';
import { Store } from './../../../model/store';
import { ViewController, LoadingController } from 'ionic-angular';
import { Component } from '@angular/core';
import { GlobalConstants } from './../../../metadata/globalConstants';
import { UserService } from '../../../modules/dataSync/services/userService';
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

  constructor(
    private viewCtrl: ViewController,
    private storeService: StoreService,
    private loading: LoadingController,
    private userService: UserService,
    private syncContext: SyncContext
  ) {
  }

  async ionViewDidEnter() {

    let loader = this.loading.create({
      content: 'Loading Stores...',
    });

    await loader.present();

    this.posId = this.syncContext.currentPos && this.syncContext.currentPos.id;
    this.storeId = this.syncContext.currentStore && this.syncContext.currentStore._id;

    this.stores = await this.storeService.getAll();

    if(!this.storeId){
      this.currentStore = this.stores[0];
      this.storeId = this.currentStore._id;
      this.posId = this.currentStore.POS.length && this.currentStore.POS[0].id;
    }else{
      this.stores.some((store: Store) => {
        if (store.POS.length > 0) {
          if (store._id === this.storeId) {
              this.currentStore = store;
              return true;
          }
        }
      });
    }

    await loader.dismiss();
  }

  public selectStore(storeId, index) {
    this.storeId = storeId;
    this.currentStore = { ...this.stores[index] };
  }

  public async switchRegister(register: POS, storeId: string) {
    var user = await this.userService.getUser();
    user.currentStore = storeId;
    user.currentPos = register.id;
    this.syncContext.initialize(this.currentStore, register.id);
    let currentPos = _.pick(register, GlobalConstants.POS_SESSION_PROPS);
    let currentStore = _.pick(this.stores.find((store) => store._id == storeId), GlobalConstants.STORE_SESSION_PROPS);
    this.userService.setSession(user);
    this.viewCtrl.dismiss({ currentStore, currentPos });
  }

  public dismiss() {
    this.viewCtrl.dismiss();
  }
}