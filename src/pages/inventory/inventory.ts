import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ProductService} from '../../services/product.service';
import { ProductsService} from '../../services/products.service';

@Component({
  selector: 'page-inventory',
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
