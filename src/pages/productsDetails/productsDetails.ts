import { Component } from '@angular/core';
import { NavController,NavParams,ViewController } from 'ionic-angular';

import { ProductService } from '../../services/ProductService';

@Component({
  selector: 'page-variables',
  templateUrl: 'productsDetails.html'
})
export class ProductsDetailsPage {
  public productItem:any={};
  public isNew = true;
  public action = 'Add';

 constructor(public navCtrl: NavController, 
    private productService:ProductService,
    public navParams: NavParams,
    private viewCtrl: ViewController) {
    
    console.log('Product Items', this.productItem);
    
  }

  ionViewDidLoad(){
    let editProduct = this.navParams.get('product');
    if(editProduct){
      this.productItem = editProduct;
      this.isNew = false;
      this.action = 'Edit';
    }
  } 

  saveProducts(){
    if (this.isNew) {
            this.productService.add(this.productItem)
                .catch(console.error.bind(console));
        } else {
            this.productService.update(this.productItem)
                .catch(console.error.bind(console));
        }

    this.navCtrl.pop();
    
  }

   addImage(){
     
   }
}
