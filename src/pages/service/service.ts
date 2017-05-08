// Created By Michael Hanse
// 05/02/2017
// Product Page TypeScript
   
import { Component, NgZone } from '@angular/core';
import { NavController, AlertController, ModalController, Platform} from 'ionic-angular';
import { ServiceService } from '../../services/ServiceService';
import { ServiceDetailsPage } from '../serviceDetails/serviceDetails';

@Component({
  selector: 'page-variables',
  templateUrl: 'service.html'
})
export class ServicesPage {
   public services = [];
   public isNew = true;
   public action = 'Add';
   public isoDate = '';
   

  constructor(public navCtrl: NavController,
          private alertCtrl:AlertController,
          private serviceService:ServiceService,
          private platform:Platform,
          private zone: NgZone,
          private modalCtrl: ModalController) {
  }

   ionViewDidLoad(){
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

  showDetail(service){
    this.navCtrl.push(ServiceDetailsPage, {service:service}); 
  } 
  
  deleteServices(item){
    this.serviceService.delete(item)
            .catch(console.error.bind(console)); 
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
