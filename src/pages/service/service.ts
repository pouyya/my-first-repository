// Created By Michael Hanse
// 05/02/2017
// Product Page TypeScript
   
import { Component, NgZone } from '@angular/core';
import { NavController, AlertController, ModalController, Platform} from 'ionic-angular';
import { ServiceService } from '../../services/serviceService';
import { ServiceDetailsPage } from '../serviceDetails/serviceDetails';

@Component({
  selector: 'page-variables',
  templateUrl: 'service.html'
})
export class ServicesPage {
   public services = [];
   public servicesBackup = [];
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

  ionViewDidEnter(){
    this.platform.ready().then(() => {

            this.serviceService.getAll()
                .then(data => {
                    this.zone.run(() => {
                        this.services = data;
                        this.servicesBackup = data;
                    });
                })
                .catch(console.error.bind(console));
        });

   }

  showDetail(service){
    this.navCtrl.push(ServiceDetailsPage, {service:service}); 
  } 
  
  deleteServices(item, idx){
    this.serviceService.delete(item)
            .catch(console.error.bind(console)); 
    // this.services. splice(idx, 1);
  }

  getItems(event){
    // Reset Services back to all of the Services
    this.services = this.servicesBackup;
    //set val to the value of the event target
    var val = event.target.value;
    
    //if the value is an empty string don`t filter the items
    if(val && val.trim() != ''){
       this.services = this.services.filter((service)=>{
         return((service.name).toLowerCase().indexOf(val.toLowerCase()) > -1);
       })
    }
  }
  
}
