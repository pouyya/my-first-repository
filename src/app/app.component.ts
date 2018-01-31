import { Component, ViewChild, ChangeDetectorRef, OnInit } from '@angular/core';
import { Nav, Platform, ModalController, LoadingController, ToastController } from 'ionic-angular';
import { Insomnia } from '@ionic-native/insomnia';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SwitchPosModal } from './modals/switch-pos/switch-pos';
import { UserService } from './../services/userService';
import { ModuleService } from './../services/moduleService';
import { PluginService } from './../services/pluginService';
import { SharedService } from './../services/_sharedService';
import { ModuleBase } from "../modules/moduelBase";
import { POS } from './../model/pos';
import { Store } from './../model/store';
import { PlatformService } from '../services/platformService';
import { DeployPage } from '../pages/deploy/deploy';

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
    private userService: UserService,
    private moduleService: ModuleService,
    private modalCtrl: ModalController,
    private loading: LoadingController,
    private insomnia: Insomnia,
    private pluginService: PluginService,
    private _sharedService: SharedService,
    private cdr: ChangeDetectorRef,
    private toastController: ToastController,
    private platformService: PlatformService
  ) {
    this._sharedService
      .getSubscribe('storeOrPosChanged')
      .takeWhile(() => this.alive)
      .subscribe((data) => {
        if (data.hasOwnProperty('currentStore') && data.hasOwnProperty('currentPos')) {
          this.currentStore = data.currentStore;
          this.currentPos = data.currentPos;
        }

        if (data.hasOwnProperty('screenAwake') && !this.platform.is('core')) {
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
    this.rootPage = DeployPage;
  }

  initializeApp() {
    this.platform.ready().then(() => {
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

      modal.present();

    } else {
      var canEnter = await this.nav[page.hasOwnProperty('pushNavigation') && page.pushNavigation ? 'push' : 'setRoot'](page.component);

      if (canEnter) {
        this.currentModule = this.moduleService.getCurrentModule(page);
        this.moduleName = this.currentModule.constructor.name;
      }

    }
  }
}