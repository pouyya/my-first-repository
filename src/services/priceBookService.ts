import { HelperService } from './helperService';
import { Injectable, NgZone } from '@angular/core';
import { PriceBook } from './../model/priceBook';
import { BaseEntityService } from './baseEntityService';

@Injectable()
export class PriceBookService extends BaseEntityService<PriceBook> {

  constructor(private zone: NgZone, private helperService: HelperService) {
    super(PriceBook, zone);
  }

  public calculateMarkup() {

  }

  public calculateRetailPriceTaxInclusive(retailPrice: number, tax: number): number {
    return this.helperService.round10(
      this.helperService.round2Dec(tax > 0 ? ((tax / 100) * retailPrice) + retailPrice : retailPrice), -1
    );
  }

  public calculateRetailPriceTaxExclusive(retailPriceTaxInclusive: number, tax: number) {
    return this.helperService.round10(
      this.helperService.round2Dec(retailPriceTaxInclusive / ( (tax / 100) + 1 )), -1
    );
  }

}