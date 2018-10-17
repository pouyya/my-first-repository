import { Component, ViewChild, OnInit } from '@angular/core';
import { Nav, Platform, ModalController, LoadingController, ToastController, ViewController, MenuController } from 'ionic-angular';
import { Insomnia } from '@ionic-native/insomnia';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SwitchPosModal } from './modals/switch-pos/switch-pos';
import { ModuleService } from './../services/moduleService';
import { ModuleBase } from "../modules/moduelBase";
import { PlatformService } from '../services/platformService';
import { DeployPage } from '../pages/deploy/deploy';
import { UserService } from '../modules/dataSync/services/userService';
import { PrintService } from '../services/printService';
import { SecurityService } from '../services/securityService';
import { SecurityAccessRightRepo } from '../model/securityAccessRightRepo';
import { SecurityResultReason } from '../infra/security/model/securityResult';
import { StoreService } from "../services/storeService";
import { SyncContext } from "../services/SyncContext";
import { DeployService } from '../services/deployService';
import { NetworkService } from '../services/networkService'

@Component({
  selector: 'app',
  templateUrl: 'app.html',
  providers: [NetworkService]
})
export class SimplePOSApp implements OnInit {
  @ViewChild(Nav) nav: Nav;
  public rootPage: any;
  public currentModule: ModuleBase;
  public moduleName: string;
  public currentPage: any;
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
    private toastController: ToastController,
    private platformService: PlatformService,
    private deployService: DeployService,
    private userService: UserService,
    private printService: PrintService,
    private securityService: SecurityService,
    private syncContext: SyncContext, // used in view
    private menuController: MenuController
  ) {
    this.currentModule = this.moduleService.getCurrentModule();
    this.moduleName = this.currentModule.constructor.name;
    this.initializeApp();
  }

  ngOnDestroy() {
    this.alive = false;
  }

  async ngOnInit() {

    let user = await this.userService.getUser(false);

    if (this.platformService.isMobileDevice()) {
      user && user.settings && user.settings.screenAwake === false ? this.insomnia.allowSleepAgain() : this.insomnia.keepAwake();
    }

    this.nav.viewDidEnter.subscribe(async (viewController: ViewController) => {
      if (viewController && viewController.instance) {
        this.currentModule = this.moduleService.getCurrentModule(viewController.instance);
        this.moduleName = this.currentModule.constructor.name;
        this.currentPage = viewController.instance;
        if (!this.currentModule.pinTheMenu) {
          await this.menuController.close();
        }
      }
    })
    var eligibleForDeploy = await this.deployService.eligibleForDeploy();
    this.rootPage = this.currentPage = eligibleForDeploy ? DeployPage : await this.deployService.getNextPageAfterDeploy();
  }

  initializeApp() {
    this.platform.ready().then(() => {

      // if (typeof Appsee !== 'undefined' && Appsee) {
      //   Appsee.start(ConfigService.ApseeApiKey());
      // }

      this.statusBar.styleDefault();
      this.statusBar.overlaysWebView(false);
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
          this.nav.setRoot(this.nav.getActive().component);
          loader.dismiss();
        });
      }
    });
    modal.present();
  }

  async openPage(page) {
    if (page.hasOwnProperty('isAddon') && page.isAddon) {
      const isEnabled = await page.isEnabled();
      if (!isEnabled) {
        let toast = this.toastController.create({
          message: "This Addon is not enabled",
          duration: 3000
        });

        toast.present();
        return;
      }
    }
    if (page.hasOwnProperty('modal') && page.modal) {
      let modal = this.modalCtrl.create(page.component);
      modal.onDidDismiss(data => {
        if (page.hasOwnProperty('onDismiss') && typeof page.onDismiss == 'function') {
          page.onDismiss(data);
        }
      });

      await modal.present();

    } else {
      await this.nav[page.hasOwnProperty('pushNavigation') && page.pushNavigation ? 'push' : 'setRoot'](page.component);
    }
  }

  isTypeOf(page: any, pageType: any): boolean {
    return pageType && (page instanceof pageType.component);
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

  async updatePrintReceiptSetting() {
    const message: string = "Settings saved";
    await this.storeService.update(this.syncContext.currentStore);
    this.toastController.create({
      message,
      duration: 3000,
      position: 'top'
    }).present();
  }
}