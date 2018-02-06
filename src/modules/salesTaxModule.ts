import { Settings } from './../pages/settings/settings';
import { ModuleBase } from './moduelBase';
import { GroupSaleTaxPage } from './../pages/admin/group-sale-tax/group-sale-tax';
import { LogOut } from './dataSync/pages/logout/logout';

export class SalesTaxModule implements ModuleBase {
  public setInjector() {
    
  }

  public pages: Array<any> = [
    { title: 'Group Sales Tax', icon: 'cash', component: GroupSaleTaxPage },
    { title: 'Settings', icon: 'cog', component: Settings },
    { title: 'Logout', icon: 'log-out', component: LogOut }
  ];

  public pinTheMenu: boolean = true;
}