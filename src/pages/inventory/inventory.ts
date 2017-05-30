import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-variables',
  templateUrl: 'inventory.html'
})
export class InventoryPage {
  public products = [];
  stock:   any;
  qty:     any;
  unit:    any;
  reOrder: any;
  constructor(public navCtrl: NavController) {

  }

  saveProducts(){

  }
  getItems(event){
    
  }
}
