import { Customer } from './../../model/customer';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { CustomerService } from '../../services/customerService';
import { NavParams, NavController } from 'ionic-angular';
import { ValidationHelper } from '../../utility/validationHelper';
import { ResourceService } from '../../services/resourceService';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';

@SecurityModule(SecurityAccessRightRepo.CustomerAddEdit)
@Component({
  selector: 'customer-details',
  templateUrl: 'customer-details.html'
})
export class CustomerDetails {

  public customerForm: FormGroup;
  public customer: Customer;
  public countries: { name: string, code: string }[] = [{ name: 'None', code: null }];
  public isNew: boolean = true;
  public action: string = 'Add';

  constructor(
    private customerService: CustomerService,
    private navParams: NavParams,
    private navCtrl: NavController,
    private resourceService: ResourceService,
    private formBuilder: FormBuilder
  ) {
    this.customer = <Customer>this.navParams.get('customer');
    if (!this.customer) {
      this.customer = new Customer();
    } else {
      this.isNew = false;
      this.action = 'Edit';
    }
    this.createForm();
  }

  async ionViewDidLoad() {
    let countries = await this.resourceService.getCountries();
    countries && (this.countries = this.countries.concat(countries));
  }

  get firstName() { return this.customerForm.get('firstName'); }
  get lastName() { return this.customerForm.get('lastName'); }
  get dob() { return this.customerForm.get('dob'); }
  get phone() { return this.customerForm.get('phone'); }
  get email() { return this.customerForm.get('email'); }
  get country() { return this.customerForm.get('country'); }
  get suburb() { return this.customerForm.get('suburb'); }
  get postcode() { return this.customerForm.get('postcode'); }

  private createForm() {
    this.customerForm = this.formBuilder.group({
      firstName: new FormControl(this.customer.firstName),
      lastName: new FormControl(this.customer.lastName),
      dob: new FormControl(this.customer.dob, []),
      phone: new FormControl(this.customer.phone, [
        Validators.pattern(/^[\+\d]?(?:[\d-.\s()]*)$/) // +999-999-9999
      ]),
      email: new FormControl(this.customer.email, [ValidationHelper.emptyOrEmail]),
      address: new FormControl(this.customer.address, []),
      suburb: new FormControl(this.customer.suburb, []),
      postcode: new FormControl(this.customer.postcode, []),
      country: new FormControl(this.customer.country, [])
    }, { validator: ValidationHelper.checkNameCombination });
  }

  public async save() {
    Object.keys(this.customerForm.value).forEach(prop => {
      this.customer[prop] = this.customerForm.value[prop];
    });

    try {
      await this.customerService[this.isNew ? 'add' : 'update'](this.customer);
      this.navCtrl.pop();
    } catch (err) {
      throw new Error(err);
    }
  }

  public async remove() {
    try {
      await this.customerService.delete(this.customer);
      this.navCtrl.pop();
    } catch (err) {
      throw new Error(err);
    }
  }

}