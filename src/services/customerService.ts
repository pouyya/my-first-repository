import { Injectable } from '@angular/core';
import { Customer } from './../model/customer';
import { BaseEntityService } from './baseEntityService';

@Injectable()
export class CustomerService extends BaseEntityService<Customer> {

  constructor() {
    super(Customer);
  }

  public async getResults(limit: number, offset: number) {
    var query: any = { selector: {entityTypeName: 'Customer'} };
    query.limit = limit;
    query.offset = offset;

    var promises: any[] = [
      async () => {
        let data = await this.getAll();
        return data.length;
      },
      async () => await this.findBy(query)
    ];

    try {
      let [totalCount, docs] = await Promise.all(promises.map(p => p()));
      return { totalCount, docs };
    } catch (err) {
      return Promise.reject(err);
    }
  }

  public async searchByName(name) {
    try {
      let customers: Customer[] = await this.findBy({
        selector: { firstName: name }
      });

      return customers.length > 0 ? customers : [];
    } catch (err) {
      return Promise.reject(err);
    }
  }

}