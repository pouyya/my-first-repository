import { LoadingController } from 'ionic-angular';
import { SortOptions } from '@simplepos/core/dist/services/baseEntityService';
import { Component, NgZone } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ServiceService } from '../../services/serviceService';
import { ServiceDetails } from '../service-details/service-details';
import { BackOfficeModule } from '../../modules/backOfficeModule';
import { PageModule } from '../../metadata/pageModule';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';
import { SearchableListing } from "../../modules/searchableListing";
import { Service } from "../../model/service";
import _ from "lodash";
import {PriceBook} from "../../model/priceBook";
import {PriceBookService} from "../../services/priceBookService";
import {Utilities} from "../../utility";

interface ServicesList extends Service {
  retailPrice: number /** From default pricebook */
}

@SecurityModule(SecurityAccessRightRepo.ServiceListing)
@PageModule(() => BackOfficeModule)
@Component({
  selector: 'page-variables',
  templateUrl: 'service.html'
})
export class Services extends SearchableListing<Service>{
  protected items: ServicesList[] = [];
  private priceBook: PriceBook;


  constructor(public navCtrl: NavController,
    private serviceService: ServiceService,
    private loading: LoadingController,
    private utility: Utilities,
    private priceBookService: PriceBookService,
    protected zone: NgZone) {
      super(serviceService, zone, 'Service');
  }

  async ionViewDidEnter() {
    let loader = this.loading.create({ content: 'Loading Services...' });
    await loader.present();
    try {
      this.options = {
        sort: [{ order: SortOptions.ASC }], conditionalSelectors: {
          order: {
            $gt: true
          }
        }
      };
      await this.fetch();

      loader.dismiss();
    } catch (err) {
      console.error(err);
      loader.dismiss();
      return;
    }
  }

  private async getPriceBook(services){
    this.priceBook = await this.priceBookService.getDefault();
    services.forEach((service) => {
      let priceBookItem = _.find(this.priceBook.purchasableItems, { id: service._id });
      service["retailPrice"] = priceBookItem ? priceBookItem.retailPrice : 0;
      service["inclusivePrice"] = priceBookItem ? priceBookItem.inclusivePrice : 0;
    });
  }

  showDetail(service) {
    this.navCtrl.push(ServiceDetails, { service: service });
  }

  public async fetchMore(infiniteScroll?: any) {
    let services: ServicesList[] = <ServicesList[]>await this.loadData();
    this.offset += services ? services.length : 0;

    this.zone.run(() => {
      this.items = this.items.concat(services);
      infiniteScroll && infiniteScroll.complete();
    });
    if(this.priceBook){
      services.forEach((service) => {
        const priceBookItem = _.find(this.priceBook.purchasableItems, { id: service._id });
        service["retailPrice"] = priceBookItem ? priceBookItem.retailPrice : 0;
        service["inclusivePrice"] = priceBookItem ? priceBookItem.inclusivePrice : 0;
      });
    }else{
      this.getPriceBook(services);
    }
  }
  public async remove(item: Service, index: number) {
    if(!this.priceBook){
      this.priceBook = await this.priceBookService.getDefault();
    }
    const deleteItem = await this.utility.confirmRemoveItem("Do you really want to delete this service!");
    if(!deleteItem){
      return;
    }
    let deleteAssocs: any[] = [
        async () => {
            // delete pricebook entries
            let pbIndex = _.findIndex(this.priceBook.purchasableItems, { id: item._id });
            if (pbIndex > -1) {
                this.priceBook.purchasableItems.splice(pbIndex, 1);
                return await this.priceBookService.update(this.priceBook);
            }
        }
    ];

    await Promise.all(deleteAssocs);
    await super.remove(item, index);
  }
}
