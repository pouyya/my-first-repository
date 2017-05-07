import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ProductsPage } from '../ProductViewModel/products';
import { ContactPage } from '../contact/contact';
import { HomePage } from '../home/home';
import { SalePage } from '../sale/sale';
import { SetupPage } from '../setup/setup'
import { AboutPage } from '../about/about';
import { InventoryPage } from '../inventory/inventory';
@Component({
  selector: 'page-variables',
  templateUrl: 'settings.html'
})
export class SettingsPage {

  constructor(public navCtrl: NavController) {

  }

  onProducts(){
    this.navCtrl.push(ProductsPage);
  }
  onSales(){
    this.navCtrl.push(SalePage);
  }
  onInventory(){
    this.navCtrl.push(InventoryPage);
  }
  onContactUs(){
    this.navCtrl.push(ContactPage);
  }
}
