import { LoadingController } from 'ionic-angular';
import { SortOptions } from '@simpleidea/simplepos-core/dist/services/baseEntityService';
import { Component, NgZone } from '@angular/core';
import { NavController, Events } from 'ionic-angular';
import { ServiceService } from '../../services/serviceService';
import { ServiceDetails } from '../service-details/service-details';
import { BackOfficeModule } from '../../modules/backOfficeModule';
import { PageModule } from '../../metadata/pageModule';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';
import {SearchableListing} from "../../modules/searchableListing";
import {Service} from "../../model/service";

@SecurityModule(SecurityAccessRightRepo.ServiceListing)
@PageModule(() => BackOfficeModule)
@Component({
  selector: 'page-variables',
  templateUrl: 'service.html'
})
export class Services extends SearchableListing<Service>{
  protected items: Service[] = [];


  constructor(public navCtrl: NavController,
    public events:Events,
    private serviceService: ServiceService,
    private loading: LoadingController,
    protected zone: NgZone) {
      super(serviceService, zone, 'Service');
      this.listenEvents();
  }

  async listenEvents(){
    this.events.subscribe('reloadServicePage',(nav) => {
      this.navCtrl.pop();
      this.navCtrl.push(Service);
    });
  
  }

  async ionViewDidEnter() {
    let loader = this.loading.create({ content: 'Loading Services...' });
    await loader.present();
    try {
      this.options = {
          sort: [{order: SortOptions.ASC}], conditionalSelectors: {
              order: {
                  $gt: true
              }
          }
      };
      await this.fetchMore();
      loader.dismiss();
    } catch (err) {
      console.error(err);
      loader.dismiss();
      return;
    }
  }  
  
  public async refreshS() {
    let loader = this.loading.create({ content: 'Loading Services...' });
    await loader.present();
    try {
      this.options = {
          sort: [{order: SortOptions.ASC}], conditionalSelectors: {
              order: {
                  $gt: true
              }
          }
      };
      await this.fetchMore();
      loader.dismiss();
    } catch (err) {
      console.error(err);
      loader.dismiss();
      return;
    }
  }

  showDetail(service) {
    this.navCtrl.push(ServiceDetails, { service: service ,  "Service": this });
  }
}
