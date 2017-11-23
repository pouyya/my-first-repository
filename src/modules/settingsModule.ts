import { GroupSaleTaxPage } from './../pages/admin/group-sale-tax/group-sale-tax';
import { SaleTaxPage } from './../pages/admin/sale-tax/sale-tax';
import { HomePage } from './../pages/home/home';
import { ModuleBase, PageSettingsInterface } from './moduelBase';
import { SecurityGuard } from '../metadata/securityGuardModule';


@SecurityGuard(['Settings'])
export class SettingsModule  implements ModuleBase {
  public setInjector() {
    
  }  
  public pages: Array<PageSettingsInterface> = [
    { title: 'Sales Tax', icon: 'cash', component: SaleTaxPage, pushNavigation: true },
    { title: 'Group Sales Tax', icon: 'cash', component: GroupSaleTaxPage, pushNavigation: true },
    { title: 'Back Office', icon: 'build', component: HomePage }
  ];
}