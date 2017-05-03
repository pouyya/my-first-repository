
import { Component } from '@angular/core';
import { NavController, AlertController} from 'ionic-angular';
import { ProductsDetailsPage } from '../productsDetails/productsDetails';
@Component({
  selector: 'page-products',
  templateUrl: 'products.html'
})
export class ProductsPage {
   products = [
    {name:'Mouse', brand:'apple',tags:'fashion', count:'6',employeer:'michael' , variant:'', price:'' ,description:'',sku:''},
    {name:'Keyword', brand:'',tags:'', count:'',employeer:'michael', variant:'', price:'' ,description:'',sku:''},
    {name:'Bag', brand:'',tags:'', count:'',employeer:'michael', variant:'', price:'' ,description:'',sku:''},
    {name:'Shirt', brand:'',tags:'', count:'',employeer:'michael', variant:'', price:'' ,description:'',sku:''}
  ];

  constructor(public navCtrl: NavController, private alertCtrl:AlertController) {

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
          text: 'Save',
          handler: data => {
            console.log('Name', data);
            this.products.push(data);
           }
        }
      ]
    });

    prompt.present(prompt);
  }
   
  onProductDetails(item: string){
    console.log("Selected Item", item);
    this.navCtrl.push(ProductsDetailsPage,{ items:item});
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
