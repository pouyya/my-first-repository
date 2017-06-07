import { HomePage } from './../pages/home/home';
import { AppMenu } from './app.menu';

export class SalesMenu {

  static routes: Array<any> = [
    { title: 'Sell', icon: 'home', component: HomePage, menu: { routes: AppMenu } },
    { title: 'Back Office', icon: 'home', component: HomePage, menu: { routes: AppMenu } }
  ];

}