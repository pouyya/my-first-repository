import { Employees } from './../employees/employees';
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Products } from '../products/products';
import { Stores } from '../stores/stores';
import { Sales } from '../sales/sales';
import { Services } from '../service/service';
import { Category } from '../category/category';

@Component({
  selector: 'page-variables',
  templateUrl: 'settings.html'
})
export class Settings {

  constructor(public navCtrl: NavController) {
  }

  onProducts(){
    this.navCtrl.push(Products);
  }
  onService(){
    this.navCtrl.push(Services);
  }
  onInventory(){
    this.navCtrl.push(Category);
  }
  onStores(){
    this.navCtrl.push(Stores);
  }
  onEmployees(){
    this.navCtrl.push(Employees);
  }
}
