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
  categoryOpt:{title:string}; 

 constructor(public navCtrl: NavController, 
    private productService:ProductService,
    private categoryService:CategoryService,
    private platform:Platform,
    public navParams: NavParams,
    private zone: NgZone,
    private viewCtrl: ViewController) {
      this.categoryOpt ={title:'Categories'};

  }

  ionViewDidLoad(){
    let editProduct = this.navParams.get('product');
     if(editProduct){
      this.productItem = editProduct;
      this.isNew = false;
      this.action = 'Edit';
    }

    this.platform.ready().then(() => {

            this.categoryService.getAll()
                .then(data => {
                    this.zone.run(() => {
                        this.categories = data;
                        console.log('Category Datas in Product Details Page===', data);
                    });
                })
                .catch(console.error.bind(console));
        });
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
