import { SalesMenu } from './../../pages/sales/menu/sales.menu';
import { Settings } from './../../pages/settings/settings';
import { Stores } from './../../pages/stores/stores';
import { Employees } from './../../pages/employees/employees';
import { Services } from './../../pages/service/service';
import { Products } from './../../pages/products/products';
import { Sales } from './../../pages/sales/sales';
import { HomePage } from './../../pages/home/home';

export class AppMenu {

  static routes: Array<any> = [
    { title: 'Home', icon: 'home', component: HomePage, menu: null },
    { title: 'POS', icon: 'cash', component: Sales, menu: SalesMenu },
    { title: 'Products', icon: 'pricetags', component: Products, menu: null },
    { title: 'Service', icon: 'bowtie', component: Services, menu: null },
    { title: 'Employees', icon: 'contacts', component: Employees, menu: null },
    { title: 'Stores', icon: 'basket', component: Stores, menu: null },
    { title: 'Settings', icon: 'cog', component: Settings, menu: null }
  ];

}