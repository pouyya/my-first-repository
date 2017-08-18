import { GroupSalesTaxService } from './groupSalesTaxService';
import { UserService } from './userService';
import { SalesTaxService } from './salesTaxService';
import { Injectable } from '@angular/core';

@Injectable()
export class TaxService {
  private tax: number;

  constructor(
    private salesTaxService: SalesTaxService,
    private groupSaleTaxService: GroupSalesTaxService,
    private userService: UserService) {

  }

  public getTax() {
    return this.tax;
  }

  public calculate(price: number, tax?: number): number {
    let _tax = tax != undefined ? tax : this.tax;
    return _tax > 0 ? price + ((_tax / 100) * price) : price;
  }
}