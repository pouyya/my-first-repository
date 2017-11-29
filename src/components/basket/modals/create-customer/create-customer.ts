import { Customer } from './../../../../model/customer';
import { NavParams, NavController, ViewController } from 'ionic-angular';
import { FormGroup, FormBuilder, FormControl, Validators, ValidatorFn } from '@angular/forms';
import { Component } from '@angular/core';
import { CustomerService } from '../../../../services/customerService';

@Component({
  selector: 'create-customer-modal',
  templateUrl: 'create-customer.html'
})
export class CreateCustomerModal {

  public customerForm: FormGroup;
  public customer: Customer;

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
    private navCtrl: NavController,
    private viewCtrl: ViewController,
    private formBuilder: FormBuilder,
    private customerService: CustomerService
  ) {
    this.customer = new Customer();
    this.createForm();
  }

  public async create() {
    Object.keys(this.customerForm.value).forEach(prop => {
      this.customer[prop] = this.customerForm.value[prop];
    });

    try {
      let result = await this.customerService.add(this.customer);
      let customer = await this.customerService.get(result.id);
      this.viewCtrl.dismiss(customer);
    } catch (err) {
      throw new Error(err);
    }
  }

  private checkNameCombination(checkWith: string): ValidatorFn {
    return (input: FormControl): any => {
      if(this.customerForm) {
        if(!input.value && !this.customerForm.value[checkWith]) {
          return {oneRequired: true };
        } else {
          return null;
        }
      } else {
        return null;
      }
    };
  }

  private createForm() {
    this.customerForm = this.formBuilder.group({
      firstName: new FormControl(this.customer.firstName, [this.checkNameCombination('lastName')]),
      lastName: new FormControl(this.customer.lastName, [this.checkNameCombination('firstName')]),
      phone: new FormControl(this.customer.phone, [
        Validators.pattern(/^[\+\d]?(?:[\d-.\s()]*)$/) // +999-999-9999
      ]),
      email: new FormControl(this.customer.email, [
        Validators.email
      ]),
      address: new FormControl(this.customer.address, []),
      suburb: new FormControl(this.customer.suburb, []),
      postcode: new FormControl(this.customer.postcode, []),
      country: new FormControl(this.customer.country, [])
    });
  }

  public dismiss() {
    this.viewCtrl.dismiss();
  }

}