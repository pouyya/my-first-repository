import { ModuleBase } from './moduelBase';
import { HomePage } from './../pages/home/home';
import { OpenCloseRegister } from './../pages/open-close-register/open-close-register';

export class SalesModule  implements ModuleBase {
  public pages: Array<any> = [
    { title: 'Sell', icon: 'home', component: HomePage },
    { title: 'Open/Close', icon: 'home', component: OpenCloseRegister },
    { title: 'Back Office', icon: 'home', component: HomePage }
  ];
}