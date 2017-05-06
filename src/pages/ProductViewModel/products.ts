// Created By Michael Hanse
// 05/02/2017
// Product Page TypeScript
   
import { Component, NgZone } from '@angular/core';
import { NavController, AlertController, ModalController, Platform} from 'ionic-angular';
import { ProductService } from '../../DBService/ProductService';
import { ProductsDetailsPage } from '../ProductViewModel/productsDetails';

@Component({
  selector: 'page-products',
  templateUrl: 'products.html'
})
export class ProductsPage {
   public products = [];
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

   ionViewDidLoad(){
    this.platform.ready().then(() => {
            this.productService.initDB();

            this.productService.getAll()
                .then(data => {
                    this.zone.run(() => {
                        this.products = data;
                    });
                })
                .catch(console.error.bind(console));
        });

   }

  showDetail(product){
    this.navCtrl.push(ProductsDetailsPage, {product:product}); 
  } 
  
  deleteProducts(item){

    this.productService.deleteProduct(item)
            .catch(console.error.bind(console)); 
      
  }

  getItems(event){

    //set val to the value of the event target
    var val = event.target.value;
    console.log("event Value==", val);
    //if the value is an empty string don`t filter the items
    if(val && val.trim() != ''){
       
    }
  }
  
}
