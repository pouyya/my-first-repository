import { QuerySelectorInterface, QueryOptionsInterface, SortOptions } from '@simpleidea/simplepos-core/dist/services/baseEntityService';
import { Component, NgZone } from '@angular/core';
import { NavController, AlertController, ModalController } from 'ionic-angular';
import { ServiceService } from '../../services/serviceService';
import { ServiceDetails } from '../service-details/service-details';
import { BackOfficeModule } from '../../modules/backOfficeModule';
import { PageModule } from '../../metadata/pageModule';
import * as _ from 'lodash';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';

@SecurityModule(SecurityAccessRightRepo.ServiceListing)
@PageModule(() => BackOfficeModule)
@Component({
  selector: 'page-variables',
  templateUrl: 'service.html'
})
export class Services {
  public services = [];
  public servicesBackup = [];
  public isoDate = '';
  private readonly defaultLimit = 10;
  private readonly defaultOffset = 0;
  private limit: number;
  private offset: number;
  private filter: any = {};


  constructor(public navCtrl: NavController,
    private alertCtrl: AlertController,
    private serviceService: ServiceService,
    private zone: NgZone,
    private modalCtrl: ModalController) {
  }

  async ionViewDidEnter() {
    try {
      let loader = this.loading.create({ content: 'Loading Services...' });
      await loader.present();
      await this.fetchMore();
      loader.dismiss();
    } catch (err) {
      console.error(err);
      return;
    }
  }

  showDetail(service) {
    this.navCtrl.push(ServiceDetails, { service: service });
  }

  async remove(item, idx) {
    try {
      await this.serviceService.delete(item);
      this.services.splice(idx, 1);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  private async loadServices(): Promise<any> {
    let selectors: QuerySelectorInterface = {
      order: {
        $exists: true
      }
    };

    let options: QueryOptionsInterface = {
      sort: [
        {
          order: SortOptions.ASC
        }
      ]
    }

    if(Object.keys(this.filter).length > 0) {
      _.each(this.filter, (value, key) => {
        if(value) {
          selectors[key] = value;
        }
      });
    }

    return await this.serviceService.search(this.limit, this.offset, selectors, options);
  }

  public async fetchMore(infiniteScroll?: any) {
    let services = await this.loadServices();
    this.offset += services ? services.length : 0;
    this.zone.run(() => {
      this.services = this.services.concat(services);
      infiniteScroll && infiniteScroll.complete();
    });
  }

  public async searchByName(event) {
    let val = event.target.value;
    this.filter['name'] = (val && val.trim() != '') ? val : "";
    this.limit = this.defaultLimit;
    this.offset = this.defaultOffset;
    this.services = [];
    await this.fetchMore();
  }
}
