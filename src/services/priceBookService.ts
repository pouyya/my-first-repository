import { HelperService } from './helperService';
import { Injectable, NgZone } from '@angular/core';
import { PriceBook } from './../model/priceBook';
import { BaseEntityService } from './baseEntityService';

@Injectable()
export class PriceBookService extends BaseEntityService<PriceBook> {

  constructor(private zone: NgZone, private helperService: HelperService) {
    super(PriceBook, zone);
  }

  public calculateRetailPriceTaxInclusive(retailPrice: number, tax: number): number {
    return tax != 0 ? this.helperService.round10(
      this.helperService.round2Dec((tax / 100) * retailPrice) + retailPrice, -1
    ) : retailPrice;
  }

  public calculateRetailPriceTaxExclusive(retailPriceTaxInclusive: number, tax: number): number {
    return this.helperService.round10(
      this.helperService.round2Dec(retailPriceTaxInclusive / ((tax / 100) + 1)), -1
    );
  }

  public calculateMarkup(supplyPrice: number, price: number): number {
    return this.helperService.round10(
      this.helperService.round2Dec((100 * (price - supplyPrice)) / supplyPrice), -1
    );
  }

  public getDefaultPriceBook(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.findBy({
        selector: { priority: 0 }
      }).then((priceBooks: Array<PriceBook>) => {
        resolve(priceBooks[0]);
      }).catch(error => reject(error));
    });
  }

  public getPriceBooks(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.findBy({
        selector: { priority: { $gt: 0 } }
      }).then((priceBooks: Array<PriceBook>) => {
        resolve(priceBooks);
      }).catch(error => reject(error));
    });
  }

  public getPriceBookByCriteria() {
    return new Promise((resolve, reject) => {
      this.findBy({
        selector: {
          "priority": {
            "$gte": 0
          }
        }
      }).then(data => resolve(data[0])).catch(error => reject(error));
    });
  }

}