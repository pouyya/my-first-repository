import { SaleTaxPage } from './../admin/sale-tax/sale-tax';
import { Category } from './../category/category';
import { Employees } from './../employees/employees';
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Products } from '../products/products';
import { Stores } from '../stores/stores';
import { Services } from '../service/service';

@Component({
  selector: 'page-variables',
  templateUrl: 'settings.html'
})
export class Settings {

  private pages = {
    products: Products,
    services: Services,
    category: Category,
    stores: Stores,
    employees: Employees,
    saleTax: SaleTaxPage
  };

  constructor(public navCtrl: NavController) {
  }

  public navigateTo(name: string) {
    this.navCtrl.push(this.pages[name]);
  }
  
}
