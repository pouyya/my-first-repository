import _ from 'lodash';
import { UserService } from './userService';
import { SalesTax } from './../model/salesTax';
import { Injectable, NgZone } from '@angular/core';
import { BaseEntityService } from './baseEntityService';

@Injectable()
export class SalesTaxService extends BaseEntityService<SalesTax> {
  constructor(private zone: NgZone, private userService: UserService) {
    super(SalesTax, zone);
  }

  public getUserSalesTax(): Promise<any> {
    return new Promise((resolve, reject) => {
      let user = this.userService.getLoggedInUser();
      this.findBy({ selector: { userId: user._id } }).then((salesTaxes: Array<any>) => {
        // TODO: Don't know why but the code is also retrieving GroupSaleTex objects
        resolve(_.filter(salesTaxes, (tax) => {
          return tax.entityTypeName === 'SalesTax';
        }));
      }).catch((error) => {
        reject(error);
      });
    })
  }

  public add(tax: SalesTax) {
    let user = this.userService.getLoggedInUser();
    tax.userId = user._id;
    return super.add(tax);
  }

  public delete(tax: SalesTax) {
    return new Promise((resolve, reject) => {
      this.getUserSalesTax().then((salesTaxes: Array<any>) => {
        // TODO: this is not a good approach, should use count query
        let len = salesTaxes.length;
        if (len > 1) {
          super.delete(tax).then(() => resolve(true), error => reject(error));
        } else {
          resolve(false);
        }
      }).catch(error => {
        reject(error);
      });
    });

  }
}