import { SalesTaxService } from './salesTaxService';
import { StoreService } from './storeService';
import { Injectable } from '@angular/core';

@Injectable()
export class TaxService {
  private tax: number;

  constructor(private storeService: StoreService, private salesTaxService: SalesTaxService) {

  }

  public _init() {
    return new Promise((resolve, reject) => {
      this.storeService.getDefaultTax().then((store: any) => {
        this.salesTaxService.get(store[0].defaultSaleTaxId).then((saleTax) => {
          this.tax = Number(saleTax.rate);
          resolve();
        }).catch((error) => {
          reject(error);
        })
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