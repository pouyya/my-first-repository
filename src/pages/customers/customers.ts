import { Component, NgZone } from '@angular/core';
import { Platform, NavController, LoadingController } from 'ionic-angular';
import { Customer } from './../../model/customer';
import { CustomerService } from './../../services/customerService';
import { BackOfficeModule } from '../../modules/backOfficeModule';
import { PageModule } from '../../metadata/pageModule';
import { CustomerDetails } from '../customer-details/customer-details';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';
import { SearchableListing } from "../../modules/searchableListing";
import {Utilities} from "../../utility";

@SecurityModule(SecurityAccessRightRepo.CustomerListing)
@PageModule(() => BackOfficeModule)
@Component({
  selector: 'customers-page',
  templateUrl: 'customers.html'
})
export class Customers extends SearchableListing<Customer>{

  public items: Customer[] = [];

  constructor(
    private customerService: CustomerService,
    private platform: Platform,
    private navCtrl: NavController,
    private loading: LoadingController,
    protected zone: NgZone,
    private utility: Utilities
  ) {
    super(customerService, zone, 'Customer');
  }

  async ionViewDidEnter() {
    try {
      let loader = this.loading.create({
        content: 'Fetching Customers...'
      });
      await loader.present();
      await this.fetch();
      await this.platform.ready();
      loader.dismiss();
    } catch (err) {
      throw new Error(err);
    }
  }

  public view(customer?: Customer) {
    this.navCtrl.push(CustomerDetails, { customer });
  }

  public async remove(customer: Customer, index: number) {
      try {
          const deleteItem = await this.utility.confirmRemoveItem("Do you really want to delete this employee!");
          if(!deleteItem){
              return;
          }
          await super.remove(customer, index);
      } catch (err) {
          throw new Error(err);
      }
  }
}