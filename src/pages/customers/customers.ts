import { Component, NgZone } from '@angular/core';
import { Platform, NavController } from 'ionic-angular';
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

  constructor(
    private customerService: CustomerService,
    private platform: Platform,
    private navCtrl: NavController,
    private zone: NgZone
  ) { }

  async ionViewDidEnter() {
    try {
      let customers = await this.customerService.getAll();
      await this.platform.ready();
      this.zone.run(() => {
        this.customers = customers;
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

  public search() {

  }

}