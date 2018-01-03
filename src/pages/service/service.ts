import { Component, NgZone } from '@angular/core';
import { NavController, AlertController, ModalController } from 'ionic-angular';
import { ServiceService } from '../../services/serviceService';
import { ServiceDetails } from '../service-details/service-details';
import { BackOfficeModule } from '../../modules/backOfficeModule';
import { PageModule } from '../../metadata/pageModule';
import * as _ from 'lodash';

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
    private alertCtrl: AlertController,
    private serviceService: ServiceService,
    private zone: NgZone,
    private modalCtrl: ModalController) {
  }

  async ionViewDidEnter() {
    this.services = this.servicesBackup = _.sortBy(await this.serviceService.getAll(), [item => parseInt(item.order) || 0]);
  }

  showDetail(service) {
    this.navCtrl.push(ServiceDetails, { service: service });
  }

  deleteServices(item, idx) {
    this.serviceService.delete(item)
      .catch(console.error.bind(console));
    this.services.splice(idx, 1);
  }

  getItems(event) {
    this.services = this.servicesBackup;
    var val = event.target.value;

    if (val && val.trim() != '') {
      this.services = this.services.filter((service) => {
        return ((service.name).toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }
}
