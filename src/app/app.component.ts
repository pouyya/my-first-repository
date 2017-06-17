import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, ModalController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SwitchPosModal } from './modals/switch-pos/switch-pos';
import { User } from './../model/user';
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

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private moduleService: ModuleService,
    private storeService: StoreService,
    private posService: PosService,
    private userService: UserService,
    private modalCtrl: ModalController
  ) {
    this.initializeApp();
    this.currentModule = this.moduleService.getCurrentModule();
    this.moduleName = this.currentModule.constructor.name;
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.posService.getCurrentPos().then((register: POS) => {
        this.register = register;
        this.storeService.getCurrentStore().then((store: Store) => {
          this.store = store;
        }).catch((error) => {
          throw new Error(error);
        });
      }).catch((error) => {
        throw new Error(error);
      });

      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  switchRegister() {
    let modal = this.modalCtrl.create(SwitchPosModal, {
      store: { ...this.store, register: this.register }
    });
    modal.onDidDismiss(data => {

    });
    modal.present();
  }

  openPage(page) {
    this.currentModule = this.moduleService.getCurrentModule(page);
    this.moduleName = this.currentModule.constructor.name;
    this.nav.setRoot(page.component);
  }

}