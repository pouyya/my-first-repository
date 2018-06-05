import { LoadingController } from 'ionic-angular';
import { SortOptions } from '@simpleidea/simplepos-core/dist/services/baseEntityService';
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

@SecurityModule(SecurityAccessRightRepo.ServiceListing)
@PageModule(() => BackOfficeModule)
@Component({
  selector: 'page-variables',
  templateUrl: 'service.html'
})
export class Services extends SearchableListing<Service>{
  protected items: Service[] = [];
  private _defaultPriceBook: PriceBook;


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
      this._defaultPriceBook = await this.priceBookService.getDefault();

      loader.dismiss();
    } catch (err) {
      console.error(err);
      loader.dismiss();
      return;
    }
  }

  showDetail(service) {
    this.navCtrl.push(ServiceDetails, { service: service });
  }

  public async remove(item: Service, index: number) {
    const deleteItem = await this.utility.confirmRemoveItem("Do you really want to delete this service!");
    if(!deleteItem){
      return;
    }
    let deleteAssocs: any[] = [
        async () => {
            // delete pricebook entries
            let pbIndex = _.findIndex(this._defaultPriceBook.purchasableItems, { id: item._id });
            if (pbIndex > -1) {
                this._defaultPriceBook.purchasableItems.splice(pbIndex, 1);
                return await this.priceBookService.update(this._defaultPriceBook);
            }
        }
    ];

    await Promise.all(deleteAssocs);
    await super.remove(item, index);
  }
}
