import { Component } from '@angular/core';
import { AboutPage } from '../about/about';
import { ContactPage } from '../contact/contact';
import { HomePage } from '../home/home';
import { ProductsPage } from '../products/products';
import { SalesPage } from '../sales/sales';
import { SetupPage } from '../setup/setup';
@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = ProductsPage;
  tab3Root = SalesPage;
  tab4Root = SetupPage;

  constructor() {

  }
}
