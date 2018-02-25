import { Component, ViewChild, OnInit } from '@angular/core';
import { Nav, Platform, ModalController, LoadingController, ToastController } from 'ionic-angular';
import { Insomnia } from '@ionic-native/insomnia';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SwitchPosModal } from './modals/switch-pos/switch-pos';
import { ModuleService } from './../services/moduleService';
import { SharedService } from './../services/_sharedService';
import { ModuleBase } from "../modules/moduelBase";
import { POS } from './../model/pos';
import { Store } from './../model/store';
import { PlatformService } from '../services/platformService';
import { DeployPage } from '../pages/deploy/deploy';
import { IonicProDeployService } from '../modules/ionicpro-deploy/ionic-pro-deploy.service';
import { UserService } from '../modules/dataSync/services/userService';
import { PrintService } from '../services/printService';
import { SecurityService } from '../services/securityService';
import { SecurityAccessRightRepo } from '../model/securityAccessRightRepo';
import { SecurityResultReason } from '../infra/security/model/securityResult';
import { StoreService } from "../services/storeService";


@Component({
  selector: 'app',
  templateUrl: 'app.html'
})
export class SimplePOSApp implements OnInit {
  @ViewChild(Nav) nav: Nav;
  public rootPage: any;
  public currentModule: ModuleBase;
  public moduleName: string;
  public currentStore: Store = null;
  public currentPos: POS = null;
  private alive: boolean = true;

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private storeService: StoreService,
    private moduleService: ModuleService,
    private modalCtrl: ModalController,
    private loading: LoadingController,
    private insomnia: Insomnia,
    private _sharedService: SharedService,
    private toastController: ToastController,
    private platformService: PlatformService,
    private ionicProDeployService: IonicProDeployService,
    private userService: UserService,
    private printService: PrintService,
    private securityService: SecurityService
  ) {
    this._sharedService
      .getSubscribe('storeOrPosChanged')
      .takeWhile(() => this.alive)
      .subscribe((data) => {
          data.hasOwnProperty('currentStore') && (this.currentStore = data.currentStore);
          data.hasOwnProperty('currentPos') && (this.currentPos = data.currentPos);
      });

    this._sharedService
      .getSubscribe('screenAwake')
      .subscribe((data) => {
          if (data.hasOwnProperty('screenAwake') && this.platformService.isMobileDevice()) {
              data.screenAwake ? this.insomnia.keepAwake() : this.insomnia.allowSleepAgain();
          }
      });

    this.currentModule = this.moduleService.getCurrentModule();
    this.moduleName = this.currentModule.constructor.name;
    this.initializeApp();
  }

  ngOnDestroy() {
    this.alive = false;
  }

  async ngOnInit() {

    let user = await this.userService.getDeviceUser();

    if (this.platformService.isMobileDevice()) {
      user && user.settings && user.settings.screenAwake === false ? this.insomnia.allowSleepAgain() : this.insomnia.keepAwake();
    }

    var eligibleForDeploy = await this.ionicProDeployService.eligibleForDeploy();
    this.rootPage = eligibleForDeploy ? DeployPage : await this.ionicProDeployService.getNextPageAfterDeploy();
  }

  initializeApp() {
    this.platform.ready().then(() => {

      // if (typeof Appsee !== 'undefined' && Appsee) {
      //   Appsee.start(ConfigService.ApseeApiKey());
      // }

      this.statusBar.styleDefault();
      this.hideSplashScreen();
    });
  }

  hideSplashScreen() {
    if (this.splashScreen) {
      setTimeout(() => {
        this.splashScreen.hide();
      }, 100);
    }
  }

  switchRegister() {
    let modal = this.modalCtrl.create(SwitchPosModal);
    modal.onDidDismiss(data => {
      if (data) {
        let loader = this.loading.create();

        loader.present().then(() => {
          data.hasOwnProperty('currentStore') && (this.currentStore = data.currentStore);
          data.hasOwnProperty('currentPos') && (this.currentPos = data.currentPos);
          this.nav.setRoot(this.nav.getActive().component);
          loader.dismiss();
        });
      }
    });
    modal.present();
  }

  async openPage(page) {
    if (page.hasOwnProperty('modal') && page.modal) {
      let modal = this.modalCtrl.create(page.component);
      modal.onDidDismiss(data => {
        if (page.hasOwnProperty('onDismiss') && typeof page.onDismiss == 'function') {
          page.onDismiss(data);
        }
      });

      await modal.present();

    } else {
      var canEnter = await this.nav[page.hasOwnProperty('pushNavigation') && page.pushNavigation ? 'push' : 'setRoot'](page.component);

      if (canEnter) {
        this.currentModule = this.moduleService.getCurrentModule(page);
        this.moduleName = this.currentModule.constructor.name;
      }
    }
  }

  async openCashDrawer() {

    var securityResult = await this.securityService.canAccess([SecurityAccessRightRepo.OpenCashDrawer], false);

    let message: string;

    if (securityResult.isValid) {
      message = "PIN validated, the drawer is opened!";
      this.printService.openCashDrawer();
    }
    else {
      switch (securityResult.reason) {
        case SecurityResultReason.notEnoughAccess:
          message = 'You do not have enough access rights!';
          break;
        case SecurityResultReason.wrongPIN:
          message = 'Incorrect PIN!';
          break;
      }
    }

    let toast = this.toastController.create({
      message,
      duration: 3000
    });
    
    toast.present();
  }

  async updatePrintReceiptSetting(){
    const message: string = "Settings saved";
      await this.storeService.update(this.currentStore);
      this.toastController.create({
          message,
          duration: 3000,
          position: 'top'
      }).present();
  }
}