import _ from 'lodash';
import { SwitchPosModal } from './../../app/modals/switch-pos/switch-pos';
import { UserSession } from './../../modules/dataSync/model/UserSession';
import { Employee } from './../../model/employee';
import { EmployeeService } from './../../services/employeeService';
import { PluginService } from './../../services/pluginService';
import { Sales } from './../sales/sales';
import { Store, POS } from './../../model/store';
import { UserService } from './../../modules/dataSync/services/userService';
import { NavController, ModalController, LoadingController, ToastController, AlertController, Events } from 'ionic-angular';
import { AccountSettingService } from './../../modules/dataSync/services/accountSettingService';
import { Component, ChangeDetectorRef } from '@angular/core';
import { StoreService } from '../../services/storeService';
import { TranslateService } from '@ngx-translate/core';
import { SyncContext } from "../../services/SyncContext";
import { BoostraperModule } from '../../modules/bootstraperModule';
import { PageModule } from '../../metadata/pageModule';
import { IonSimpleWizardComponent } from '../../components/ion-simple-wizard/ion-simple-wizard.component';
import { IonSimpleWizardStepComponent } from '../../components/ion-simple-wizard/ion-simple-wizard.step.component';

@PageModule(() => BoostraperModule)
@Component({
  selector: 'data-bootstrapper',
  templateUrl: 'data-bootstrapper.html'
})
export class DataBootstrapper {

  public message: string;
  public securityMessage: string;
  public headerTitle: string;
  public hideSpinner: boolean;
  public haveAccess: boolean;

  private _initialPage: any;
  private _user: UserSession;
  private store: Store;

  public step: any;
  public stepCondition: any;
  public stepDefaultCondition: any;
  public currentStep: any;

  constructor(
    private accountSettingService: AccountSettingService,
    private storeService: StoreService,
    private userService: UserService,
    private employeeService: EmployeeService,
    private pluginService: PluginService,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private loading: LoadingController,
    private cdr: ChangeDetectorRef,
    private translateService: TranslateService,
    private syncContext: SyncContext,
    public alertCtrl: AlertController,
    public events: Events
  ) {
    this.cdr.detach();
    this.securityMessage = `To open the app, please provide your PIN number (No Store Selected)`;
    this._initialPage = Sales;
    this.headerTitle = "Launching...";
    this.hideSpinner = false;
    this.haveAccess = false;
    /**
     * Step Wizard Settings
     */
    this.step = 1;//The value of the first step, always 1
    this.stepCondition = false;//Set to true if you don't need condition in every step
    this.stepDefaultCondition = this.stepCondition;//Save the default condition for every step
    //You can subscribe to the Event 'step:changed' to handle the current step
    this.events.subscribe('step:changed', step => {
      //Handle the current step if you need
      this.currentStep = step;
      //Set the step condition to the default value
      this.stepCondition = this.stepDefaultCondition;
    });
    this.events.subscribe('step:next', () => {
      //Do something if next
      console.log('Next pressed: ', this.currentStep);
    });
    this.events.subscribe('step:back', () => {
      //Do something if back
      console.log('Back pressed: ', this.currentStep);
    });
  }
  /**
   * Demo functions
   */
  onFinish() {
    this.alertCtrl.create({
      message: 'Wizard Finished!!',
      title: 'Congrats!!',
      buttons: [{
        text: 'Ok'
      }]
    }).present();
  }

  toggle() {
    this.stepCondition = !this.stepCondition;
  }
  getIconStep2() {
    return this.stepCondition ? 'unlock' : 'lock';
  }

  getIconStep3() {
    return this.stepCondition ? 'happy' : 'sad';
  }
  getLikeIcon() {
    return this.stepCondition ? 'thumbs-down' : 'thumbs-up';
  }
  goToExample2() {
    // this.navCtrl.push(DynamicPage);
  }

  textChange(e) {
    if (e.target.value && e.target.value.trim() !== '') {
      this.stepCondition = true;
    } else {
      this.stepCondition = false;
    }
  }

  /** @AuthGuard */
  async ionViewCanEnter() {
    this.translateService.setDefaultLang('au');
    this.translateService.use('au');

    this._user = await this.userService.getDeviceUser();
    if (this._user.currentStore) {
      this.store = await this.storeService.get(this._user.currentStore);
      this.securityMessage = `To open the app for store ${this.store.name}, please provide your PIN number`
    }
    return this.enterPin();
  }

  async ionViewDidLoad() {
    this.cdr.reattach();
    this.haveAccess && await this.loadData(this.store);
  }

  public async enterPin(): Promise<boolean> {
    let pin = await this.pluginService.openPinPrompt('Enter PIN', 'User Authorization', [],
      { ok: 'OK', cancel: 'Cancel' });

    let employee: Employee;

    if (!pin) {
      return true;
    }

    employee = await this.employeeService.findByPin(pin);
    if (employee && employee.isAdmin || (employee && (employee.isActive && employee.store && _.find(employee.store, { id: this._user.currentStore }) != undefined))) {
      this.haveAccess = true;
    }

    if (!this.haveAccess) {

      if (employee && !employee.isActive)
        this.toastCtrl.create({ message: 'Employee is not active', duration: 5000 }).present();
      else
        this.toastCtrl.create({ message: 'Invalid Access', duration: 5000 }).present();
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
        let store = await this.storeService.get(this._user.currentStore);
        this.securityMessage = `To open the app for shop ${store.name}, please provide your PIN number`;
        loader.dismiss();
        await this.openNextPage();
      }
    });
    modal.present();
  }

  private async loadData(store?: Store) {
    let accountSettings = await this.accountSettingService.getCurrentSetting();
    let currentPos: POS;
    let currentStore: Store;

    if (!this._user.currentPos || !this._user.currentStore) {

      if (!store) {
        let allStores = await this.storeService.getAll();
        currentStore = allStores[0];
      } else {
        currentStore = store;
      }

      currentPos = currentStore.POS[0];

      this._user.currentPos = currentPos.id;
      this._user.currentStore = currentStore._id;
      this.userService.setSession(this._user);
    } else {
      currentStore = await this.storeService.get(this._user.currentStore);
      currentStore.POS.some(pos => {
        if (pos.id === this._user.currentPos) {
          currentPos = pos;
          return true;
        }
      });
    }
    this.syncContext.initialize(currentStore, currentPos.id);
    this.syncContext.appTimezone = accountSettings.timeOffset;
    this.navCtrl.setRoot(this._initialPage);
  }

  public async openNextPage() {
    await this.enterPin();
    this.haveAccess && await this.loadData();
  }

}