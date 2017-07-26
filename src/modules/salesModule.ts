import { SalesHistoryPage } from './../pages/sales-history/sales-history';
import { Sales } from './../pages/sales/sales';
import { ModuleBase } from './moduelBase';
import { HomePage } from './../pages/home/home';
import { OpenCloseRegister } from './../pages/open-close-register/open-close-register';

export class SalesModule  implements ModuleBase {
  public pages: Array<any> = [
    { title: 'POS', icon: 'cash', component: Sales },
    { title: 'Open/Close', icon: 'bookmarks', component: OpenCloseRegister },
    { title: 'Sales History', icon: 'cash', component: SalesHistoryPage },
    { title: 'Back Office', icon: 'build', component: HomePage }
  ];
}