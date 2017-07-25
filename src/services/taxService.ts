import _ from 'lodash';
import { GroupSaleTax } from './../model/groupSalesTax';
import { SalesTax } from './../model/salesTax';
import { GroupSalesTaxService } from './groupSalesTaxService';
import { UserService } from './userService';
import { SalesTaxService } from './salesTaxService';
import { StoreService } from './storeService';
import { Injectable } from '@angular/core';

@Injectable()
export class TaxService {
  private tax: number;

  constructor(
    private storeService: StoreService, 
    private salesTaxService: SalesTaxService,
    private groupSaleTaxService: GroupSalesTaxService,
    private userService: UserService) {

  }

  public _init() {
    return new Promise((resolve, reject) => {
      let user = this.userService.getLoggedInUser();
      let service = { "SalesTax": "salesTaxService", "GroupSaleTax": "groupSaleTaxService" };
      this[service[user.settings.taxEntity]].get(user.settings.defaultTax).then((tax: any) => {
        if(user.settings.taxEntity == "GroupSaleTax") {
          var promises = [];
          tax.salesTaxes.forEach((saleTax: any) => {
            promises.push(this.salesTaxService.get(saleTax._id));
          });
          Promise.all(promises).then((results: Array<any>) => {
            this.tax = _.reduce(results.map((model: any) => model.rate), (sum, n) => sum + n, 0);
            resolve();
          }).catch(error => reject(error));
        } else {
          this.tax = tax.rate; resolve();
        }
        
      }).catch((error) => {
        reject(error);
      })
    });
  }

  public getTax() {
    return this.tax;
  }

  public calculate(price: number, tax?: number): number {
    let _tax = tax != undefined ? tax : this.tax;
    return _tax > 0 ? price + ((_tax / 100) * price) : price;
  }
}