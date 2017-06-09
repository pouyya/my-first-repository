import { ModuleBase } from './moduelBase';
import { HomePage } from './../pages/home/home';

export class SalesModule  implements ModuleBase {
  public pages: Array<any> = [
    { title: 'Sell', icon: 'home', component: HomePage },
    { title: 'Back Office', icon: 'home', component: HomePage }
  ];
}