import { LogOut } from './dataSync/pages/logout/logout';
import { Closures } from './../pages/closures/closures';
import { PosService } from './../services/posService';
import { Injector } from '@angular/core';
import { ToastController } from 'ionic-angular';
import { ClockInOutPage } from './../pages/clock-in-out/clock-in-out';
import { SalesHistoryPage } from './../pages/sales-history/sales-history';
import { Sales } from './../pages/sales/sales';
import { ModuleBase, PageSettingsInterface, ModalPageInterface } from './moduelBase';
import { HomePage } from './../pages/home/home';
import { OpenCloseRegister } from './../pages/open-close-register/open-close-register';
import { MoneyInOut } from './../pages/money-in-out/money-in-out';
import { SyncContext } from "../services/SyncContext";
import { Pro } from "@ionic/pro";

export class SalesModule implements ModuleBase {
  private toastCtrl: ToastController;
  private posService: PosService;
  private context: SyncContext

  constructor() {
  }

  public moneyInOut_disableFunc(data: any): Promise<boolean> {
    return new Promise((resolve, reject) =>{
      resolve(this.context.currentPos.status);
    });
  }

  public setInjector(injector: Injector): void {
    this.toastCtrl = injector.get(ToastController);
    this.posService = injector.get(PosService);
  }

  public pages: Array<PageSettingsInterface | ModalPageInterface> = [
    { title: 'POS', icon: 'cash', component: Sales },
    { title: 'Open/Close', icon: 'bookmarks', component: OpenCloseRegister },
    { title: 'Sales History', icon: 'list', component: SalesHistoryPage },
    { title: 'Clock In/Out', icon: 'time', component: ClockInOutPage, modal: true },
    { title: 'Money In/Out', icon: 'cash', component: MoneyInOut, disableFunc: this.moneyInOut_disableFunc },
    { title: 'Closures', icon: 'bookmarks', component: Closures },
    { title: 'Back Office', icon: 'build', component: HomePage },
    { title: 'Logout', icon: 'log-out', component: LogOut }
  ];

  public pinTheMenu: boolean = false;
}