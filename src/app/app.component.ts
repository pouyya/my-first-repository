import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Nav, Platform, ModalController, LoadingController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SwitchPosModal } from './modals/switch-pos/switch-pos';
import { UserService } from './../services/userService';
import { PosService } from './../services/posService';
import { ModuleService } from './../services/moduleService';
import { ModuleBase } from "../modules/moduelBase";
import { DeployPage } from "../pages/deploy/deploy";

@Component({
  templateUrl: 'app.html'
})
export class ShortCutsApp {
  @ViewChild(Nav) nav: Nav;
  rootPage: any = DeployPage;
  currentModule: ModuleBase;
  moduleName: string;
  user: any;

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private moduleService: ModuleService,
    private posService: PosService,
    private userService: UserService,
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
      let loader = this.loading.create();

      loader.present().then(() => {
        this.user = this.userService.getLoggedInUser();
        this.nav.setRoot(this.nav.getActive().component);
        loader.dismiss();
      });
    });
    modal.present();
  }

  openPage(page) {
    this.currentModule = this.moduleService.getCurrentModule(page);
    this.moduleName = this.currentModule.constructor.name;
    this.nav[page.hasOwnProperty('pushNavigation') && page.pushNavigation ? 'push' : 'setRoot'](page.component);
  }

}