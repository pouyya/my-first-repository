import { AboutPage } from './../pages/about/about';
import { StaffsTimeLogs } from './../pages/admin/staffs-time-logs/staffs-time-logs';
import { PriceBooksPage } from './../pages/price-books/price-books';
import { Category } from './../pages/category/category';
import { Injectable } from '@angular/core';
import { Settings } from './../pages/settings/settings';
import { Stores } from './../pages/stores/stores';
import { Employees } from './../pages/employees/employees';
import { Services } from './../pages/service/service';
import { Sales } from './../pages/sales/sales';
import { HomePage } from './../pages/home/home';
import { ModuleBase } from "./moduelBase";
import { Customers } from '../pages/customers/customers';
import { LogOut } from '../pages/logout/logout';

@Injectable()
// @SecurityGuard(['BackOffice'])
export class BackOfficeModule implements ModuleBase {
  public setInjector() {
  }

  public pages = [
    { title: 'Home', icon: 'home', component: HomePage },
    { title: 'POS', icon: 'cash', component: Sales },
    { title: 'Inventory', icon: 'cube', component: Category },
    { title: 'Service', icon: 'bowtie', component: Services },
    { title: 'Employees', icon: 'contacts', component: Employees },
    { title: 'Customers', icon: 'contacts', component: Customers },
    { title: 'Stores', icon: 'basket', component: Stores },
    { title: 'Price Books', icon: 'bookmark', component: PriceBooksPage },
    { title: 'Staffs Time Logs', icon: 'time', component: StaffsTimeLogs },
    { title: 'Settings', icon: 'cog', component: Settings },
    { title: 'About', icon: 'information-circle', component: AboutPage },
    { title: 'Logout', icon: 'log-out', component: LogOut }
  ];    

  public pinTheMenu: boolean = true;
}