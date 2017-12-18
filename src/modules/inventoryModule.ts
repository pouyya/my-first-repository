import { Products } from './../pages/products/products';
import { HomePage } from './../pages/home/home';
import { Category } from '../pages/category/category';
import { ModuleBase, PageSettingsInterface, ModalPageInterface } from './moduelBase';
import { SecurityGuard } from '../metadata/securityGuardModule';

@SecurityGuard(['BackOffice'])
export class InventoryModule implements ModuleBase {
  public setInjector() {

  }

  public pages: Array<PageSettingsInterface | ModalPageInterface> = [
    { title: 'Category', icon: 'cash', component: Category },
    { title: 'Brands', icon: 'cash', component: Category },
    { title: 'Products', icon: 'pricetags', component: Products },
    { title: 'Suppliers', icon: 'cash', component: Category },
    { title: 'Orders', icon: 'cash', component: Category },
    { title: 'Stock Control', icon: 'cash', component: Category },
    { title: 'Back Office', icon: 'build', component: HomePage },
  ];

  public pinTheMenu: boolean = true;

}