import { ModuleService } from './../services/moduleService';
import { AppMenu } from './../menus/app.menu';
import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { HomePage } from '../pages/home/home';
import { ModuleBase } from "../modules/moduelBase";

@Component({
  templateUrl: 'app.html'
})
export class ShortCutsApp {
  @ViewChild(Nav) nav: Nav;
  rootPage:any = HomePage;
  currentModule: ModuleBase;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen, private moduleService: ModuleService) {
    this.initializeApp();
    this.currentModule = this.moduleService.getCurrentModule();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    this.currentModule = this.moduleService.getCurrentModule(page);
    this.nav.setRoot(page.component);
  }
}