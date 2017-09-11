import { Injector } from '@angular/core';
import { ToastController } from 'ionic-angular';
import { ClockInOutPage } from './../pages/clock-in-out/clock-in-out';
import { SalesHistoryPage } from './../pages/sales-history/sales-history';
import { Sales } from './../pages/sales/sales';
import { ModuleBase, PageSettingsInterface, ModalPageInterface } from './moduelBase';
import { HomePage } from './../pages/home/home';
import { OpenCloseRegister } from './../pages/open-close-register/open-close-register';

export class SalesModule implements ModuleBase {
  private toastCtrl: ToastController;

  constructor() {
  }

  public modalCallbacks: any = {
    clockInOut: (data: any) => {
      if (data.hasOwnProperty('message') && data.message) {
        let toast = this.toastCtrl.create({
          message: data.message,
          duration: 3000
        });
        toast.present();
      }
    }
  };

  public setInjector(injector: Injector): void {
    this.toastCtrl = injector.get(ToastController);
  }

  public pages: Array<PageSettingsInterface | ModalPageInterface> = [
    { title: 'POS', icon: 'cash', component: Sales },
    { title: 'Open/Close', icon: 'bookmarks', component: OpenCloseRegister },
    { title: 'Sales History', icon: 'list', component: SalesHistoryPage },
    { title: 'Clock In/Out', icon: 'time', component: ClockInOutPage, modal: true, onDismiss: this.modalCallbacks.clockInOut },
    { title: 'Back Office', icon: 'build', component: HomePage }
  ];
}