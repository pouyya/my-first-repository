import { AppMenu } from './../../../app/menu/app.menu';
import { HomePage } from './../../home/home';

export class SalesMenu {

  static routes: Array<any> = [
    { title: 'Sell', icon: 'home', component: HomePage, menu: AppMenu },
    { title: 'Back Office', icon: 'home', component: HomePage, menu: AppMenu }
  ];

}