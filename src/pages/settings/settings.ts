import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ProductsPage } from '../products/products';
import { ContactPage } from '../contact/contact';
import { HomePage } from '../home/home';
import { SalePage } from '../sale/sale';
import { SetupPage } from '../setup/setup'
import { AboutPage } from '../about/about';
import { InventoryPage } from '../inventory/inventory';
import { ServicesPage } from '../service/service';

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
    this.navCtrl.push(ServicesPage);
  }
  onInventory(){
    this.navCtrl.push(InventoryPage);
  }
  onContactUs(){
    this.navCtrl.push(ContactPage);
  }
}
