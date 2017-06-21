import { UserSettingsService } from './../services/userSettingsService';
import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Nav, Platform, ModalController, LoadingController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SwitchPosModal } from './modals/switch-pos/switch-pos';
import { UserService } from './../services/userService';
import { PosService } from './../services/posService';
import { StoreService } from './../services/storeService';
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
  user: any;

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
    // assume user is from localstore
    // then store user in localStorage
    this.user = this.userService.getLoggedInUser();
    this.currentModule = this.moduleService.getCurrentModule();
    this.moduleName = this.currentModule.constructor.name;
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  switchRegister() {
    let modal = this.modalCtrl.create(SwitchPosModal);
    modal.onDidDismiss(data => {
      this.cdr.detach();
      let loader = this.loading.create();

      loader.present().then(() => {
        this.cdr.reattach();
        this.initializeApp();
        loader.dismiss();
      });
    });
    modal.present();
  }

  openPage(page) {
    this.currentModule = this.moduleService.getCurrentModule(page);
    this.moduleName = this.currentModule.constructor.name;
    this.nav.setRoot(page.component);
  }

}