import { Component } from '@angular/core';
import { AboutPage } from '../about/about';
import { ContactPage } from '../contact/contact';
import { HomePage } from '../home/home';
import { ProductsPage } from '../products/products';
import { SalePage } from '../sale/sale';
import { SetupPage } from '../setup/setup';
@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = ProductsPage;
  tab3Root = SalePage;
  tab4Root = SetupPage;

  constructor() {

  }
}
