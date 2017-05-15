import { Component, NgZone } from '@angular/core';
import { NavController,NavParams,ViewController,Platform } from 'ionic-angular';
import { ProductService } from '../../services/ProductService';
import { CategoryService } from '../../services/categoryService';

@Component({
  templateUrl: 'productsDetails.html'
})
export class ProductsDetailsPage {
  public productItem:any={};
  public categories = [];
  public isNew = true;
  public action = 'Add';
  public isCategoryId =[];
  public isCategoryName =[];
  categoryOpt:{title:string}; 

  constructor(public navCtrl: NavController, 
    private productService:ProductService,
    private categoryService:CategoryService,
    private platform:Platform,
    public navParams: NavParams,
    private zone: NgZone,
    private viewCtrl: ViewController) {
        
  }
  //-------------------------------------------------   
  // When the page is loaded, this function should be run. 
  ionViewDidLoad(){
    let editProduct = this.navParams.get('product');
    if(editProduct){
        this.productItem = editProduct;
        this.isNew = false;
        this.action = 'Edit';
        if(this.productItem.categories){
                this.isCategoryName = this.productItem.categories.categoryName;
            }
              
    }

    this.platform.ready().then(() => {

        this.categoryService.getAll().then(data => {this.zone.run(() => {
                        this.categories = data;
                        
                    });
                })
                .catch(console.error.bind(console));
        });
    }

    setAvailableCategory(items){

        for(let cat of this.categories){
            var cName = cat.name;
            for(let it of items){
                if(cName == it){
                     cat.isUsed = true;
                     this.isCategoryId.push(cat._id);
                     this.categoryService.update(cat).catch(console.error.bind(console));
                     
                }
            }
        }
        
    }

    //-------------------------------------------------   
    // Save Product Function.
    saveProducts(){
        if(this.isCategoryName){
                this.setAvailableCategory(this.isCategoryName);
        }
        this.productItem.categories = {
            categoryName: this.isCategoryName,
            categoryID: this.isCategoryId,
        }
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
