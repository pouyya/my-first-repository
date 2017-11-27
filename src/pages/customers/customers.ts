import { Component, NgZone } from '@angular/core';
import { Platform, NavController, LoadingController } from 'ionic-angular';
import { Customer } from './../../model/customer';
import { CustomerService } from './../../services/customerService';
import { BackOfficeModule } from '../../modules/backOfficeModule';
import { PageModule } from '../../metadata/pageModule';
import { CustomerDetails } from '../customer-details/customer-details';

@PageModule(() => BackOfficeModule)
@Component({
  selector: 'customers-page',
  templateUrl: 'customers.html'
})
export class Customers {

  public customers: Customer[] = [];
  public customersBackup: Customer[] = [];
  private readonly defaultLimit = 10;
  private readonly defaultOffset = 0;
  private limit: number;
  private offset: number;
  private total: number;

  constructor(
    private customerService: CustomerService,
    private platform: Platform,
    private navCtrl: NavController,
    private loading: LoadingController,
    private zone: NgZone
  ) {
    this.limit = this.defaultLimit;
    this.offset = this.defaultOffset;
    this.total = 0;    
  }

  async ionViewDidEnter() {
    try {
      let loader = this.loading.create({
        content: 'Fetching Customers...'
      });
      await loader.present();
      let result = await this.customerService.getResults(this.limit, this.offset);
      await this.platform.ready();
      this.zone.run(() => {
        this.total = result.totalCount;
        this.offset += this.limit;
        this.customers = result.docs;
        this.customersBackup = this.customers;
        loader.dismiss();
      });
    } catch (err) {
      throw new Error(err);
    }
  }

  public view(customer?: Customer) {
    this.navCtrl.push(CustomerDetails, { customer });
  }

  public async remove(customer: Customer, index: number) {
    try {
      await this.customerService.delete(customer);
      this.customers.splice(index, 1);
    } catch (err) {
      throw new Error(err);
    }
  }

  public search(event) {
    this.customers = this.customersBackup;
    var val = event.target.value;
    if (val && val.trim() != '') {
      this.customers = this.customers.filter((item) => {
        return ((item.firstName + ' ' + item.lastName).toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }

  public async getCustomers(limit?: number, offset?: number): Promise<any> {
    if (this.customers.length <= 0) {
      let result = await this.customerService.getResults(
        limit | this.limit, offset | this.offset);
      if (result.totalCount > 0) {
        this.total = result.totalCount;
        this.customers = result.docs;
        this.customersBackup = this.customers;
      }
    } else {
      if (this.total > this.customers.length) {
        let result: any = await this.customerService.getResults(
          limit | this.limit, offset | this.offset);
        this.customers = this.customers.concat(result.docs);
        this.customersBackup = this.customers;
      }
    }
  }

  public async fetchMore(infiniteScroll?: any) {
    try {
      await this.getCustomers()
      this.offset += this.limit;
      infiniteScroll && infiniteScroll.complete();
      return;
    } catch (err) {
      return Promise.reject(err);
    }
  }

}