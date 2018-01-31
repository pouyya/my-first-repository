import { Customer } from './../../../../model/customer';
import { NavParams, ViewController } from 'ionic-angular';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Component } from '@angular/core';
import { CustomerService } from '../../../../services/customerService';
import { ValidationHelper } from '../../../../utility/validationHelper';

@Component({
  selector: 'create-customer-modal',
  templateUrl: 'create-customer.html'
})
export class CreateCustomerModal {

  public customerForm: FormGroup;
  public customer: Customer;
  public isNew: boolean = true;
  public text: string = 'Create';

  get firstName() { return this.customerForm.get('firstName'); }
  get lastName() { return this.customerForm.get('lastName'); }
  get phone() { return this.customerForm.get('phone'); }
  get email() { return this.customerForm.get('email'); }
  get country() { return this.customerForm.get('country'); }
  get suburb() { return this.customerForm.get('suburb'); }
  get address() { return this.customerForm.get('address'); }
  get postcode() { return this.customerForm.get('postcode'); }

  constructor(
    private navParams: NavParams,
    private viewCtrl: ViewController,
    private formBuilder: FormBuilder,
    private customerService: CustomerService
  ) {
    this.customer = new Customer();

    let searchInput = this.navParams.get("searchInput") as string;
    let customer: Customer = <Customer>this.navParams.get("customer");
    if (searchInput) {
      var fullName = searchInput.trim().replace("  ", " ").split(" ");

      if (fullName.length > 0) {
        this.customer.firstName = fullName[0].trim();
      }
      if (fullName.length > 1) {
        this.customer.lastName = fullName[1].trim();
      }
    }

    if(customer) {
      this.customer = customer;
      this.isNew = false;
      this.text = 'Update';
    }

    this.createForm();
  }

  public async create() {
    Object.keys(this.customerForm.value).forEach(prop => {
      this.customer[prop] = this.customerForm.value[prop];
    });

    if(this.isNew) {
      let result = await this.customerService.add(this.customer);
      let customer = await this.customerService.get(result.id);
      this.viewCtrl.dismiss(customer);
    } else {
      await this.customerService.update(this.customer);
      this.viewCtrl.dismiss();
    }
  }

  private createForm() {
    this.customerForm = this.formBuilder.group({
      firstName: new FormControl(this.customer.firstName),
      lastName: new FormControl(this.customer.lastName),
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

  public dismiss() {
    this.viewCtrl.dismiss();
  }

}