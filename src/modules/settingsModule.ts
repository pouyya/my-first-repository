import { GroupSaleTaxPage } from './../pages/admin/group-sale-tax/group-sale-tax';
import { SaleTaxPage } from './../pages/admin/sale-tax/sale-tax';
import { HomePage } from './../pages/home/home';
import { ModuleBase, PageSettingsInterface } from './moduelBase';
import { Roles } from '../pages/roles/roles';
import { DeleteAccount } from '../pages/delete-account/delete-account';
import { LogOut } from './dataSync/pages/logout/logout';

export class SettingsModule  implements ModuleBase {
  public setInjector() {
    
  }  
  public pages: Array<PageSettingsInterface> = [
    { title: 'Sales Tax', icon: 'cash', component: SaleTaxPage, pushNavigation: true },
    { title: 'Group Sales Tax', icon: 'cash', component: GroupSaleTaxPage, pushNavigation: true },
    { title: 'Roles', icon: 'people', component: Roles },
    { title: 'Delete Account', icon: 'delete', component: DeleteAccount },
    { title: 'Back Office', icon: 'build', component: HomePage },
    { title: 'Logout', icon: 'log-out', component: LogOut }
  ];

  public pinTheMenu: boolean = true;
}