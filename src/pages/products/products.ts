import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ProductsDetailsPage } from '../productsDetails/productsDetails';
@Component({
  selector: 'page-products',
  templateUrl: 'products.html'
})
export class ProductsPage {

  constructor(public navCtrl: NavController) {

  }

  addProducts(){
    
  }
  onProductDetails(){
    this.navCtrl.push(ProductsDetailsPage);
  }
}
