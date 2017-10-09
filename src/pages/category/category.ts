import { Component, NgZone } from '@angular/core';
import { NavController, AlertController, ModalController, Platform} from 'ionic-angular';
import { CategoryService } from '../../services/categoryService';
import { CategoryDetails } from '../category-details/category-details';
import { BackOfficeModule } from '../../modules/backOfficeModule';
import { PageModule } from '../../metadata/pageModule';

@PageModule(() => BackOfficeModule)
@Component({
  selector: 'page-variables',
  templateUrl: 'category.html'
})
export class Category {
   public items = [];
   public itemsBackup = [];
   public isNew = true;
   public action = 'Add';

  constructor(public navCtrl: NavController,
          private alertCtrl:AlertController,
          private service:CategoryService,
          private platform:Platform,
          private zone: NgZone,
          private modalCtrl: ModalController) {
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
  
  showDetail(category){
    this.navCtrl.push(CategoryDetails, {category:category}); 
  } 
  
   delete(item, idx){
    let confirm = this.alertCtrl.create({
      title: 'Confirm Delete Category?',
      message: 'This Category using in Products or Services. Do you want to delete this Category?',
      buttons: [
        {
          text: 'YES',
          handler: () => {
            console.log("Using Category Delete");
            
            this.service.delete(item).catch(console.error.bind(console));
            this.items.splice(idx, 1);  
              
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
    this.items = this.itemsBackup;
    var val = event.target.value;
    
    if(val && val.trim() != ''){
       this.items = this.items.filter((category)=>{
         return((category.name).toLowerCase().indexOf(val.toLowerCase()) > -1);
       })
    }
  }
}
