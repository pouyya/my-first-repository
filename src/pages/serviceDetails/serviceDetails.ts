import { Component } from '@angular/core';
import { NavController,NavParams,ViewController } from 'ionic-angular';

import { ServiceService } from '../../services/ServiceService';

@Component({
  selector: 'page-variables',
  templateUrl: 'serviceDetails.html'
})
export class ServiceDetailsPage {
  public serviceItem:any={};
  public isNew = true;
  public action = 'Add';

 constructor(public navCtrl: NavController, 
    private serviceService:ServiceService,
    public navParams: NavParams,
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
