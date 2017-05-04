
import { Component, NgZone } from '@angular/core';
import { NavController, AlertController, ModalController, Platform} from 'ionic-angular';
import { ProductService} from '../../services/product.service';
import { ProductsService} from '../../services/products.service';

import { ProductsDetailsPage } from '../products/productsDetails';
@Component({
  selector: 'page-products',
  templateUrl: 'products.html'
})
export class ProductsPage {
   public products = [];
   public isNew = true;
   public action = 'Add';
   public isoDate = '';
  //   {name:'Mouse', brand:'apple',tags:'fashion', count:'6',employeer:'michael' , variant:'', price:'' ,description:'',sku:''},
  //   {name:'Keyword', brand:'',tags:'', count:'',employeer:'michael', variant:'', price:'' ,description:'',sku:''},
  //   {name:'Bag', brand:'',tags:'', count:'',employeer:'michael', variant:'', price:'' ,description:'',sku:''},
  //   {name:'Shirt', brand:'',tags:'', count:'',employeer:'michael', variant:'', price:'' ,description:'',sku:''}
  // ];

  constructor(public navCtrl: NavController,
          private alertCtrl:AlertController,
          private productService:ProductService,
          private productsService:ProductsService,
          private platform:Platform,
          private zone: NgZone,
          private modalCtrl: ModalController) {
          

  }

   ionViewDidLoad(){
    //  this.productService.getSelectedProduct().then((data)=>{
    //     if(data){
    //       this.products = JSON.parse(data);
    //     }
    //  });

    this.platform.ready().then(() => {
            this.productsService.initDB();

            this.productsService.getAll()
                .then(data => {
                    this.zone.run(() => {
                        this.products = data;
                    });
                })
                .catch(console.error.bind(console));
        });

   }

  addProducts(): void {
    let prompt = this.alertCtrl.create({
      title: 'Add New Products',
      message: 'Enter the name of your Product below:',
      inputs: [
        {
          name: 'name'
        }
      ],
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Add',
          handler: data => {
            console.log('Name', data);
            this.products.push(data);
           }
        }
      ]
    });

    prompt.present(prompt);
  }
  
  deleteProducts(item){
     let index = this.products.indexOf(item);
     if(index > -1){
       this.products.splice(index, 1);
     }
     console.log('Remove Item', this.products);
     this.saveProduct();
  }

  onProductDetails(item: string, idx: number){
    console.log("index = ", idx);
    let modal = this.modalCtrl.create(ProductsDetailsPage,{ items:item})
    modal.onDidDismiss(
        data=>{
          if(data){
            this.products[idx] = data;
            this.isNew = false;
            this.saveProduct();
          }
        }
    );
    modal.present();
  }
  
  getItems(event){

    //set val to the value of the event target
    var val = event.target.value;
    console.log("event Value==", val);
    //if the value is an empty string don`t filter the items
    if(val && val.trim() != ''){
       
    }
  }
 saveProduct(){
  if(this.isNew){
    this.productsService.addProduct(this.products).catch(console.error.bind(console));
  }else{
    this.productsService.updateProduct(this.products).catch(console.error.bind(console));
  }    
   
 }
}
