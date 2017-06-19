import { UserSettingsService } from './../services/userSettingsService';
import { User } from './../model/user';
import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Nav, Platform, ModalController, LoadingController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SwitchPosModal } from './modals/switch-pos/switch-pos';
import { UserService } from './../services/userService';
import { POS } from './../model/pos';
import { PosService } from './../services/posService';
import { StoreService } from './../services/storeService';
import { Store } from './../model/store';
import { ModuleService } from './../services/moduleService';
import { HomePage } from '../pages/home/home';
import { ModuleBase } from "../modules/moduelBase";

@Component({
  templateUrl: 'app.html'
})
export class ShortCutsApp {
  @ViewChild(Nav) nav: Nav;
  rootPage: any = HomePage;
  currentModule: ModuleBase;
  moduleName: string;
  store: Store;
  register: POS;
  registers: Array<POS> = [];

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private moduleService: ModuleService,
    private storeService: StoreService,
    private posService: PosService,
    private userService: UserService,
    private userSettingsService: UserSettingsService,
    private modalCtrl: ModalController,
    private loading: LoadingController,
    private cdr: ChangeDetectorRef
  ) {
    this.initializeApp().then(() => { console.log('App Initialized!') });
    this.currentModule = this.moduleService.getCurrentModule();
    this.moduleName = this.currentModule.constructor.name;
  }

  initializeApp(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.platform.ready().then(() => {
        let userPromise = this.userService.getLoggedInUser().then((user: User) => {
          this.userSettingsService.getSettings(user._id).then((userSettings) => {
            user = { ...user, settings: userSettings };
            localStorage.setItem('user', JSON.stringify(user));
          }).catch((error) => {
            Promise.reject(error);
          });
        });

        let storePromise = new Promise((resolve, reject) => {
          this.posService.getCurrentPos().then((register: POS) => {
            this.register = register;
            this.storeService.getCurrentStore().then((store: Store) => {
              this.store = store;
              this.posService.findBy({ selector: { storeId: store._id } }).then((registers: Array<POS>) => {
                if (registers.length > 0) {
                  this.registers = registers;
                }
                resolve();
              }).catch((error) => {
                reject(error);
              });              
              resolve();
            }).catch((error) => reject(error));
          }).catch((error) => reject(error));
        });

        Promise.all([ userPromise, storePromise ]).then(() => {
          this.statusBar.styleDefault();
          this.splashScreen.hide();
          resolve();
        }).catch((error) => { reject(error); });
      });
    });
  }

  switchRegister() {
    let modal = this.modalCtrl.create(SwitchPosModal, {
      store: { ...this.store, registers: this.registers }
    });
    modal.onDidDismiss(data => {
      this.cdr.detach();
      let loader = this.loading.create({
        content: 'Switching POS...'
      });

      loader.present().then(() => {
        this.initializeApp().then(() => {
          this.cdr.reattach();
          loader.dismiss();
        });
      });
      // window.location.reload()
    });
    modal.present();
  }

  openPage(page) {
    this.currentModule = this.moduleService.getCurrentModule(page);
    this.moduleName = this.currentModule.constructor.name;
    this.nav.setRoot(page.component);
  }

}