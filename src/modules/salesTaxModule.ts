import { Settings } from './../pages/settings/settings';
import { ModuleBase } from './moduelBase';
import { GroupSaleTaxPage } from './../pages/admin/group-sale-tax/group-sale-tax';

export class SalesTaxModule implements ModuleBase {
  public pages: Array<any> = [
    { title: 'Group Sales Tax', icon: 'cash', component: GroupSaleTaxPage },
    { title: 'Settings', icon: 'cog', component: Settings }
  ];
}