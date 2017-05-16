// --------------------------------------------------
// -------------Product.ts--------------------------
// --------------------------------------------------
// Created By Michael Hanse, 05/02/2017

   
import { Component, NgZone } from '@angular/core';
import { NavController, AlertController, ModalController, Platform} from 'ionic-angular';
import { ProductService } from '../../services/productService';
import { ProductsDetailsPage } from '../productsDetails/productsDetails';

@Component({
  templateUrl: 'products.html'
})
export class ProductsPage {
   public products = [];
   public productsBackup = [];
   public isNew = true;
   public action = 'Add';
   public isoDate = '';
   

  constructor(public navCtrl: NavController,
          private alertCtrl:AlertController,
          private productService:ProductService,
          private platform:Platform,
          private zone: NgZone,
          private modalCtrl: ModalController) {
  }
  
  //-------------------------------------------------   
  // When the page is loaded, this function should be run.
  ionViewDidLoad(){
     this.platform.ready().then(() => {

            this.productService.getAll()
                .then(data => {
                    this.zone.run(() => {
                        this.products = data;
                        this.productsBackup = data;
                        console.log('Products Page Data===', data);
                    });
                })
                .catch(console.error.bind(console));
      });

 } 
  
  //-------------------------------------------------   
  // Go to details Page  
  showDetail(product){
    this.navCtrl.push(ProductsDetailsPage, {product:product}); 
  } 
  
  //-------------------------------------------------   
  // Product Delete Function
  deleteProducts(item, idx){
    this.productService.delete(item)
            .catch(console.error.bind(console)); 
    // this.products.splice(idx, 1);
  }
  
  //-------------------------------------------------   
  // Product Search Function
  getItems(event){
    // Reset Products back to all of the Products
    this.products = this.productsBackup;
    //set val to the value of the event target
    var val = event.target.value;
    
    //if the value is an empty string don`t filter the items
    if(val && val.trim() != ''){
       this.products = this.products.filter((product)=>{
         return((product.name).toLowerCase().indexOf(val.toLowerCase()) > -1);
       })
    }
  }
  
}
