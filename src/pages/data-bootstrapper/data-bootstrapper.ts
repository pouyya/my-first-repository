import _ from 'lodash';
import { SwitchPosModal } from './../../app/modals/switch-pos/switch-pos';
import { UserSession } from './../../modules/dataSync/model/UserSession';
import { Employee } from './../../model/employee';
import { EmployeeService } from './../../services/employeeService';
import { PluginService } from './../../services/pluginService';
import { Sales } from './../sales/sales';
import { Store } from './../../model/store';
import { UserService } from './../../modules/dataSync/services/userService';
import { NavController, ModalController, LoadingController } from 'ionic-angular';
import { AccountSettingService } from './../../modules/dataSync/services/accountSettingService';
import { Component, ChangeDetectorRef } from '@angular/core';
import { DateTimeService } from '../../services/dateTimeService';
import { PosService } from '../../services/posService';
import { StoreService } from '../../services/storeService';
import { SharedService } from '../../services/_sharedService';
import { POS } from '../../model/pos';

@Component({
  selector: 'data-bootstrapper',
  templateUrl: 'data-bootstrapper.html'
})
export class DataBootstrapper {

  public message: string;
  public headerTitle: string;
  public hideSpinner: boolean;
  public haveAccess: boolean;

  private _initialPage: any;
  private _user: UserSession;

  constructor(
    private accountSettingService: AccountSettingService,
    private dateTimeService: DateTimeService,
    private posService: PosService,
    private storeService: StoreService,
    private _sharedService: SharedService,
    private userService: UserService,
    private employeeService: EmployeeService,
    private pluginService: PluginService,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private loading: LoadingController,
    private cdr: ChangeDetectorRef
  ) {
    this.cdr.detach();
    this._initialPage = Sales;
    this.headerTitle = "Launching...";
    this.hideSpinner = false;
    this.haveAccess = false;
  }

  /** @AuthGuard */
  async ionViewCanEnter() {
    this._user = await this.userService.getDeviceUser();
    return this.enterPin();
  }

  async ionViewDidLoad() {
    this.cdr.reattach();
    this.haveAccess && await this.loadData();
  }

  public async enterPin(): Promise<boolean> {
    let pin = await this.pluginService.openPinPrompt('Enter PIN', 'User Authorization', [],
      { ok: 'OK', cancel: 'Cancel' });
    if (pin) {
      let employee: Employee = await this.employeeService.findByPin(pin);
      if ((employee && employee.store && _.find(employee.store, { id: this._user.currentStore }) != undefined) || employee.isAdmin) {
        this.haveAccess = true;
      }
    }
    return true;
  }

  public switchStore() {
    let modal = this.modalCtrl.create(SwitchPosModal);
    modal.onDidDismiss(async data => {
      if (data) {
        let loader = this.loading.create();
        await loader.present();
        this._user = await this.userService.getDeviceUser();
        loader.dismiss();
        await this.openNextPage();
      }
    });
    modal.present();
  }

  private async loadData() {
    let accountSettings = await this.accountSettingService.getCurrentSetting();
    let currentPos: POS;
    let currentStore: Store;

    this.dateTimeService.timezone = accountSettings.timeOffset || null;

    if (!this._user.currentPos || !this._user.currentStore) {
      let allPos: POS[] = await this.posService.getAll();

      if (!allPos || allPos.length == 0) {
        this.hideSpinner = true;
        this.headerTitle = "Error connecting to server!";
        this.message = "There is a problem in syncing data. Seems like the app is offline. Please make sure the app is connected to internet and close and open the app again.";
        return;
      }
      currentPos = allPos[0];
      currentStore = await this.storeService.get(currentPos.storeId);
      this._user.currentPos = currentPos._id;
      this._user.currentStore = currentStore._id;
      this._sharedService.publish('storeOrPosChanged', { currentStore, currentPos });
      this.userService.setSession(this._user);
    } else {
      currentPos = await this.posService.get(this._user.currentPos);
      currentStore = await this.storeService.get(this._user.currentStore);
    }

    this._sharedService.publish('storeOrPosChanged', { currentStore, currentPos });
    this.navCtrl.setRoot(this._initialPage);
  }

  public async openNextPage() {
    await this.enterPin();
    this.haveAccess && await this.loadData();
  }

}