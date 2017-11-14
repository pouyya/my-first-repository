import { Component, NgZone } from '@angular/core';
import { NavController, AlertController, ModalController, Platform} from 'ionic-angular';
import { ServiceService } from '../../services/serviceService';
import { ServiceDetails } from '../service-details/service-details';
import { BackOfficeModule } from '../../modules/backOfficeModule';
import { PageModule } from '../../metadata/pageModule';
import { SecurityGuard } from '../../metadata/securityGuardModule';
import { ServicesPageRoleModule } from '../../modules/roles/servicesPageRoleModule';

@SecurityGuard(() => ServicesPageRoleModule)
@PageModule(() => BackOfficeModule)
@Component({
  selector: 'page-variables',
  templateUrl: 'service.html'
})
export class Services {
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
    this.navCtrl.push(ServiceDetails, {service:service}); 
  } 
  
  deleteServices(item, idx){
    this.serviceService.delete(item)
            .catch(console.error.bind(console)); 
    this.services. splice(idx, 1);
  }

  getItems(event){
    this.services = this.servicesBackup;
    var val = event.target.value;
    
    if(val && val.trim() != ''){
       this.services = this.services.filter((service)=>{
         return((service.name).toLowerCase().indexOf(val.toLowerCase()) > -1);
       })
    }
  }
}
