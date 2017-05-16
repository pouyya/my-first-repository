import { Component, NgZone } from '@angular/core';
import { NavController,NavParams,ViewController, Platform } from 'ionic-angular';
import { CategoryService } from '../../services/categoryService';
import { ServiceService } from '../../services/serviceService';

@Component({
  selector: 'page-variables',
  templateUrl: 'serviceDetails.html'
})
export class ServiceDetailsPage {
  public serviceItem:any={};
  public categories = [];
  public isNew = true;
  public action = 'Add';

 constructor(public navCtrl: NavController, 
    private serviceService:ServiceService,
    private categoryService:CategoryService,
    public navParams: NavParams,
    private zone: NgZone,
    private platform:Platform,
    private viewCtrl: ViewController) {
    
    console.log('Product Items', this.serviceItem);
    
  }

  ionViewDidLoad(){
    let editProduct = this.navParams.get('service');
    if(editProduct){
      this.serviceItem = editProduct;
      this.isNew = false;
      this.action = 'Edit';
    }
    this.platform.ready().then(() => {
      
      this.categoryService.getAll()
                .then(data => {
                    this.zone.run(() => {
                        this.categories = data;
                        console.log('Category Datas in ServiceDetails Page===', data);
                    });
                })
                .catch(console.error.bind(console));
        });

  } 

  saveService(){
    if (this.isNew) {
            this.serviceService.add(this.serviceItem)
                .catch(console.error.bind(console));
        } else {
            this.serviceService.update(this.serviceItem)
                .catch(console.error.bind(console));
        }

    this.navCtrl.pop();
    
  }

   addImage(){
     
   }
}
