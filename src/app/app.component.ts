import { Stores } from './../pages/stores/stores';
import { Employees } from './../pages/employees/employees';
import { Services } from './../pages/service/service';
import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { HomePage } from '../pages/home/home';
import { Products } from '../pages/products/products';
import { Sales } from '../pages/sales/sales';
import { Settings } from '../pages/settings/settings';

@Component({
  templateUrl: 'app.html'
})
export class ShortCutsApp {
  @ViewChild(Nav) nav: Nav;
  rootPage:any = HomePage;
  pages: Array<{title: string, icon: string, component: any}>;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Home', icon: 'home', component: HomePage },
      { title: 'POS', icon: 'cash', component: Sales },
      { title: 'Products', icon: 'pricetags', component: Products },
      { title: 'Service', icon: 'bowtie', component: Services },
      { title: 'Employees', icon: 'contacts', component: Employees },
      { title: 'Stores', icon: 'basket', component: Stores },
      { title: 'Settings', icon: 'cog', component: Settings },
    ];
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    this.nav.setRoot(page.component);
  }
}