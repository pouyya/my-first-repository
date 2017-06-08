import { Injectable } from '@angular/core';
import { Settings } from './../pages/settings/settings';
import { Stores } from './../pages/stores/stores';
import { Employees } from './../pages/employees/employees';
import { Services } from './../pages/service/service';
import { Products } from './../pages/products/products';
import { Sales } from './../pages/sales/sales';
import { HomePage } from './../pages/home/home';
import { ModuleBase } from "./moduelBase";

@Injectable()
export class BackOfficeModule implements ModuleBase {
  public pages: Array<any> = [
    { title: 'Home', icon: 'home', component: HomePage },
    { title: 'POS', icon: 'cash', component: Sales },
    { title: 'Products', icon: 'pricetags', component: Products },
    { title: 'Service', icon: 'bowtie', component: Services },
    { title: 'Employees', icon: 'contacts', component: Employees },
    { title: 'Stores', icon: 'basket', component: Stores },
    { title: 'Settings', icon: 'cog', component: Settings }
  ];    
}