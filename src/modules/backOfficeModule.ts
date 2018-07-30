import { AboutPage } from './../pages/about/about';
import { PriceBooksPage } from './../pages/price-books/price-books';
import { Categories } from './../pages/categories/categories';
import { Injectable } from '@angular/core';
import { Settings } from './../pages/settings/settings';
import { Stores } from './../pages/stores/stores';
import { Services } from './../pages/service/service';
import { Sales } from './../pages/sales/sales';
import { HomePage } from './../pages/home/home';
import { ModuleBase } from "./moduelBase";
import { Customers } from '../pages/customers/customers';
import { LogOut } from './dataSync/pages/logout/logout';
import { ReportsDashboard } from '../pages/report-dashboard/report-dashboard';
import { HumanResourceDashboard } from "../pages/human-resource-dashboard/human-resource-dashboard";

@Injectable()
export class BackOfficeModule implements ModuleBase {
  public setInjector() {
  }

  public pages = [
    { title: 'Home', icon: 'home', component: HomePage },
    { title: 'POS', icon: 'cash', component: Sales },
    { title: 'Inventory', icon: 'cube', component: Categories },
    { title: 'Service', icon: 'bowtie', component: Services },
    { title: 'Customers', icon: 'contacts', component: Customers },
    { title: 'Stores', icon: 'basket', component: Stores },
    { title: 'Price Books', icon: 'bookmark', component: PriceBooksPage },
    { title: 'Human Resource', icon: 'people', component: HumanResourceDashboard },
    { title: 'Report', icon: 'print', component: ReportsDashboard },
    { title: 'Settings', icon: 'cog', component: Settings },
    { title: 'About', icon: 'information-circle', component: AboutPage },
    { title: 'Logout', icon: 'log-out', component: LogOut }
  ];    

  public pinTheMenu: boolean = true;
}