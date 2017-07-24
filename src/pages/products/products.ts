import { Component, NgZone } from '@angular/core';
import { NavController, AlertController, Platform} from 'ionic-angular';
import { ProductService } from '../../services/productService';
import { ProductDetails } from '../product-details/product-details';

import { PageModule } from './../../metadata/pageModule';
import { SalesTaxModule } from './../../modules/salesTaxModule';

@PageModule(() => SalesTaxModule)
@Component({
  templateUrl: 'products.html'
})
export class Products {
   public items = [];
   public itemsBackup = [];

  constructor(public navCtrl: NavController,
          private alertCtrl: AlertController,
          private service: ProductService,
          private platform:Platform,
          private zone: NgZone) {
  }
  
  ionViewDidEnter(){
     this.platform.ready().then(() => {

            this.service.getAll()
                .then(data => {
                    this.zone.run(() => {
                        this.items = data;
                        this.itemsBackup = data;
                    });
                })
                .catch(console.error.bind(console));
      });
 } 
  
  showDetail(item){
    this.navCtrl.push(ProductDetails, {item:item}); 
  } 
  
  delete(item, idx){
    this.service.delete(item)
            .catch(console.error.bind(console)); 
    this.items.splice(idx, 1);
  }
  
  getItems(event){
    this.items = this.itemsBackup;
    var val = event.target.value;
    
    if(val && val.trim() != ''){
       this.items = this.items.filter((item)=>{
         return((item.name).toLowerCase().indexOf(val.toLowerCase()) > -1);
       })
    }
  }
}
