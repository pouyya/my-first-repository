
// --------------------------------------------------
// -------------Category.ts--------------------------
// --------------------------------------------------
// Created By Michael Hanse ,05/02/2017
 
   
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
   public categoriesBackup = [];
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
  
  //-------------------------------------------------   
  // When the page is loaded, this function should be run.
   ionViewDidLoad(){
      this.platform.ready().then(() => {
        this.categoryService.getAll()
                .then(data => {
                    this.zone.run(() => {
                        this.categories = data;
                        this.categoriesBackup = data;
                    });
                })
                .catch(console.error.bind(console));
      });
      
   }
  
  //-------------------------------------------------   
  // Go to details Page  
  showDetail(category){
    this.navCtrl.push(CategoryDetailsPage, {category:category}); 
  } 
  
  //-------------------------------------------------   
  // Category Delete Function
  deleteCategories(item, idx){
    
    if(item.IsCategoryUsed(item._id)){
      this.showConfirmAlert(item, idx);
    } else {
      
      this.categoryService.delete(item)
            .catch(console.error.bind(console));
      this.categories.splice(idx, 1);
    }
    
    
             
  }
  
  //-------------------------------------------------   
  // Category Delete Confirm Function
   showConfirmAlert(item, idx){
    
    let confirm = this.alertCtrl.create({
      title: 'Confirm Delete Category?',
      message: 'This Category using in Products or Services. Do you want to delete this Category?',
      buttons: [
        {
          text: 'YES',
          handler: () => {
            console.log("Using Category Delete");
            
            this.categoryService.delete(item)
            .catch(console.error.bind(console));
            this.categories.splice(idx, 1);  
              
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

 
  //-------------------------------------------------   
  // Category Search Function
  getItems(event){
    // Reset Categories back to all of the Categories
    this.categories = this.categoriesBackup;
    //set val to the value of the event target
    var val = event.target.value;
    
    //if the value is an empty string don`t filter the items
    if(val && val.trim() != ''){
       this.categories = this.categories.filter((category)=>{
         return((category.name).toLowerCase().indexOf(val.toLowerCase()) > -1);
       })
    }
  }
  
}
