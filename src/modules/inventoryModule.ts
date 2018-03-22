import { Products } from './../pages/products/products';
import { HomePage } from './../pages/home/home';
import { Categories } from '../pages/categories/categories';
import { ModuleBase, PageSettingsInterface, ModalPageInterface } from './moduelBase';
import { Brands } from '../pages/brands/brands';
import { Suppliers } from '../pages/suppliers/suppliers';
import { Orders } from '../pages/orders/orders';

export class InventoryModule implements ModuleBase {
  public setInjector() {
  }

  public pages: Array<PageSettingsInterface | ModalPageInterface> = [
    { title: 'Category', icon: 'cash', component: Categories },
    { title: 'Brands', icon: 'cash', component: Brands },
    { title: 'Products', icon: 'pricetags', component: Products },
    { title: 'Suppliers', icon: 'contacts', component: Suppliers },
    { title: 'Orders', icon: 'cash', component: Orders },
    { title: 'Stock Control', icon: 'cash', component: Categories },
    { title: 'Back Office', icon: 'build', component: HomePage },
  ];

  public pinTheMenu: boolean = true;
}