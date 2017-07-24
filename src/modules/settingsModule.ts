import { SaleTaxPage } from './../pages/admin/sale-tax/sale-tax';
import { HomePage } from './../pages/home/home';
import { ModuleBase } from './moduelBase';


export class SettingsModule  implements ModuleBase {
  public pages: Array<any> = [
    { title: 'Sales Tax', icon: 'cash', component: SaleTaxPage },
    { title: 'Back Office', icon: 'build', component: HomePage }
  ];
}