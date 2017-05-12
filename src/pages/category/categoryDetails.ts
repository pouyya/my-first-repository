import { Component } from '@angular/core';
import { NavController,NavParams,ViewController } from 'ionic-angular';

import { CategoryService } from '../../services/categoryService';

@Component({
  selector: 'page-variables',
  templateUrl: 'categoryDetails.html'
})
export class CategoryDetailsPage {
  public categoryItem:any={};
  public isNew = true;
  public action = 'Add';

 constructor(public navCtrl: NavController, 
    private categoryService:CategoryService,
    public navParams: NavParams,
    private viewCtrl: ViewController) {
    
    
  }

  ionViewDidLoad(){
    let editProduct = this.navParams.get('category');
    console.log('Get from DB Category Items', editProduct);
    if(editProduct){
      this.categoryItem = editProduct;
      this.isNew = false;
      this.action = 'Edit';
    }
  } 

  saveCategories(){
   
   console.log('Updated Category Items====',this.categoryItem);
    if (this.isNew) {
            this.categoryService.add(this.categoryItem)
                .catch(console.error.bind(console));
    } else {
            this.categoryService.update(this.categoryItem)
                .catch(console.error.bind(console));
    }

    this.navCtrl.pop();
    
  }

   addImage(){
     
   }
}
