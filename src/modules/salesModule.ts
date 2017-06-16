import { Sales } from './../pages/sales/sales';
import { ModuleBase } from './moduelBase';
import { HomePage } from './../pages/home/home';
import { OpenCloseRegister } from './../pages/open-close-register/open-close-register';

export class SalesModule  implements ModuleBase {
  public pages: Array<any> = [
    { title: 'POS', icon: 'cash', component: Sales },
    { title: 'Open/Close', icon: 'bookmarks', component: OpenCloseRegister },
    { title: 'Back Office', icon: 'build', component: HomePage }
  ];
}