import { Sales } from './../sales/sales';
import { Store } from './../../model/store';
import { UserService } from './../../modules/dataSync/services/userService';
import { NavController } from 'ionic-angular';
import { AccountSettingService } from './../../modules/dataSync/services/accountSettingService';
import { OnInit, Component } from '@angular/core';
import { DateTimeService } from '../../services/dateTimeService';
import { PosService } from '../../services/posService';
import { StoreService } from '../../services/storeService';
import { SharedService } from '../../services/_sharedService';
import { POS } from '../../model/pos';

@Component({
  selector: 'data-bootstrapper',
  templateUrl: 'data-bootstrapper.html'
})
export class DataBootstrapper implements OnInit {

  private _initialPage: any;

  constructor(
    private accountSettingService: AccountSettingService,
    private dateTimeService: DateTimeService,
    private posService: PosService,
    private storeService: StoreService,
    private _sharedService: SharedService,
    private userService: UserService,
    private navCtrl: NavController
  ) {
    this._initialPage = Sales;
  }

  async ngOnInit() {
    let user = await this.userService.getDeviceUser();
    let accountSettings = await this.accountSettingService.getCurrentSetting();
    let currentPos: POS;
    let currentStore: Store;

    this.dateTimeService.timezone = accountSettings.timeOffset || null;

    if (!user.currentPos || !user.currentStore) {
      let allPos: POS[] = await this.posService.getAll();
      currentPos = allPos[0];
      currentStore = await this.storeService.get(currentPos.storeId);
      user.currentPos = currentPos._id;
      user.currentStore = currentStore._id;
      this._sharedService.publish('storeOrPosChanged', { currentStore, currentPos });
      this.userService.setSession(user);
    } else {
      currentPos = await this.posService.get(user.currentPos);
      currentStore = await this.storeService.get(user.currentStore);
    }

    this._sharedService.publish('storeOrPosChanged', { currentStore, currentPos });
    this.navCtrl.setRoot(this._initialPage);
  }

}