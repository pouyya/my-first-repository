import { Closures } from './../pages/closures/closures';
import { Injector } from '@angular/core';
import { ToastController } from 'ionic-angular';
import { ClockInOutPage } from './../pages/clock-in-out/clock-in-out';
import { SalesHistoryPage } from './../pages/sales-history/sales-history';
import { Sales } from './../pages/sales/sales';
import { Bumps } from '../pages/bumps/bumps';
import { ModuleBase, PageSettingsInterface, ModalPageInterface } from './moduelBase';
import { HomePage } from './../pages/home/home';
import { OpenCloseRegister } from './../pages/open-close-register/open-close-register';
import { MoneyInOut } from './../pages/money-in-out/money-in-out';
import { Preferences } from "../pages/preferences/preferences";

export class SalesModule implements ModuleBase {
  private toastCtrl: ToastController;

  public setInjector(injector: Injector): void {
    this.toastCtrl = injector.get(ToastController);
  }

  public pages: Array<PageSettingsInterface | ModalPageInterface> = [
    { title: 'POS', icon: 'cash', component: Sales },
    { title: 'Open/Close', icon: 'bookmarks', component: OpenCloseRegister },
    { title: 'Sales History', icon: 'list', component: SalesHistoryPage, pushNavigation: true },
    { title: 'Bumps', icon: 'list', component: Bumps },
    { title: 'Clock In/Out', icon: 'time', component: ClockInOutPage, modal: true },
    { title: 'Money In/Out', icon: 'cash', component: MoneyInOut, pushNavigation: true },
    { title: 'Closures', icon: 'bookmarks', component: Closures },
    { title: 'Preferences', icon: 'settings', component: Preferences },
    { title: 'Back Office', icon: 'build', component: HomePage }
  ];

  public pinTheMenu: boolean = false;
}