import { SalesTax } from './../../../model/salesTax';
import { SalesTaxService } from './../../../services/salesTaxService';
import { Component } from '@angular/core';

@Component({
  selector: 'sale-tax-page',
  templateUrl: 'sale-tax.html'
})
export class SaleTaxPage {

  public salesTaxes: Array<SalesTax> = [];

  constructor(private salesTaxService: SalesTaxService) {

  }

  ionViewDidEnter() {
    this.salesTaxService.getUserSalesTax().then((taxes: Array<SalesTax>) => {
      this.salesTaxes = taxes;
    }).catch((error) => {

    });
  }

}