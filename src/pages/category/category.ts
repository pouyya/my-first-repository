// Created By Michael Hanse
// 05/02/2017
// Product Page TypeScript
   
import { Component, NgZone } from '@angular/core';
import { NavController, AlertController, ModalController, Platform} from 'ionic-angular';
import { CategoryService } from '../../services/categoryService';
import { CategoryDetailsPage } from '../category/categoryDetails';
import { ProductService } from '../../services/ProductService';
import { ServiceService } from '../../services/ServiceService';
@Component({
  selector: 'page-variables',
  templateUrl: 'category.html'
})
export class CategoryPage {
   public categories = [];
   public products = [];
   public services = [];
   public isNew = true;
   public action = 'Add';
   public isoDate = '';
   public catOpt : string;
   

  constructor(public navCtrl: NavController,
          private alertCtrl:AlertController,
          private categoryService:CategoryService,
          private productService:ProductService,
          private serviceService:ServiceService,
          private platform:Platform,
          private zone: NgZone,
          private modalCtrl: ModalController) {
  }

   ionViewDidLoad(){
      this.platform.ready().then(() => {
        this.categoryService.getAll()
                .then(data => {
                    this.zone.run(() => {
                        this.categories = data;
                    });
                })
                .catch(console.error.bind(console));
      });
      this.platform.ready().then(() => {
        this.productService.getAll()
                .then(data => {
                    this.zone.run(() => {
                        this.products = data;
                    });
                })
                .catch(console.error.bind(console));
      });
      this.platform.ready().then(() => {
        this.serviceService.getAll()
                .then(data => {
                    this.zone.run(() => {
                        this.services = data;
                    });
                })
                .catch(console.error.bind(console));
      }); 
   }

  showDetail(category){
    this.navCtrl.push(CategoryDetailsPage, {category:category}); 
  } 
  
  deleteCategories(item, idx){

    var catOpt = item.name;
    var isDelete = false;
    for(let product of this.products){
      if(catOpt == product.categories){
         
        this.showConfirmAlert(item, idx);
        isDelete = true;
        return;
      }
    }

    for(let service of this.services){
      if(catOpt == service.categories){
        isDelete = true;
        this.showConfirmAlert(item, idx);
        isDelete = true;
        return;
      }
    }

    if(!isDelete){
      console.log("Don`t use Category Delete");
      this.categories.splice(idx, 1);
      this.categoryService.delete(item)
            .catch(console.error.bind(console));
             
    }
    
  }

  showConfirmAlert(item, idx){
    let confirm = this.alertCtrl.create({
      title: 'Confirm Delete Category?',
      message: 'This Category using in Products or Services. Do you want to delete this Category?',
      buttons: [
        {
          text: 'YES',
          handler: () => {
            console.log("Using Category Delete");
            this.categories.splice(idx, 1); 
            this.categoryService.delete(item)
            .catch(console.error.bind(console)); 
              
          }
        },
        {
          text: 'NO',
          handler: () => {
             
          }
        }
      ]
    });
    confirm.present()
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
