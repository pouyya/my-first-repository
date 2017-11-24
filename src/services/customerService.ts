import { Injectable } from '@angular/core';
import { Customer } from './../model/customer';
import { BaseEntityService } from './baseEntityService';

@Injectable()
export class CustomerService extends BaseEntityService<Customer> {

  constructor() {
    super(Customer);
  }

}