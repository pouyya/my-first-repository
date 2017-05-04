import { Component } from '@angular/core';
import { NavController,NavParams,ViewController } from 'ionic-angular';

import { ProductService} from '../../services/product.service';

@Component({
  selector: 'page-productsDetails',
  templateUrl: 'productsDetails.html'
})
export class ProductsDetailsPage {
  productItem:any;
  name:any;
  brand:any;
  tag:any;
  count:any;
  employeer:any;
  variant:any;
  price:any;
  description:any;
  sku:any;


  constructor(public navCtrl: NavController, 
    private productService:ProductService,
    public navParams: NavParams,
    private viewCtrl: ViewController) {
    this.productItem = this.navParams.get('items');
    console.log('Product Items', this.productItem);
    
  }

  saveProducts(){
    if(this.name){
      this.productItem.name = this.name;
    }
    if(this.brand){
      this.productItem.brand = this.brand;
    }
     if(this.tag){
      this.productItem.tag = this.tag
    }
     if(this.count){
       this.productItem.count = this.count;
    }
     if(this.employeer){
      this.productItem.employeer = this.employeer;
    }
     if(this.variant){
      this.productItem.variant = this.variant;
    }
     if(this.price){
      this.productItem.price = this.price;
    }
     if(this.description){
      this.productItem.description = this.description;
    }
     if(this.sku){
      this.productItem.sku = this.sku;
    }
      this.viewCtrl.dismiss(this.productItem);
    //  console.log("saved Items", this.productItem);

    }

    dismiss() {
        this.viewCtrl.dismiss();
    }
   addImage(){
     
   }
}
