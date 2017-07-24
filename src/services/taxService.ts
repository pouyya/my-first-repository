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
    private userService: UserService) {

  }

  public _init() {
    return new Promise((resolve, reject) => {
      let user = this.userService.getLoggedInUser();
      this.salesTaxService.get(user.settings.defaultTax).then((saleTax) => {
        this.tax = Number(saleTax.rate);
        resolve();
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