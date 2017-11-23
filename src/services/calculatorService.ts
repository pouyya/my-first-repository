import { TaxService } from './taxService';
import { Injectable } from "@angular/core";

@Injectable()
export class CalculatorService {
  constructor(private taxService: TaxService) {

  }
  
  /**
   * Calculate price reduction by a discount(%)
   * @param discount {Number}
   * @param price {Number}
   */
  public calcItemDiscount(discount: number, price: number) {
    return discount > 0 ?  price - ((discount / 100) * price) : price;
  }

  /**
   * Calculate discount(%) on an Item
   * @param actualPrice {Number}
   * @param newPrice {Number}
   */
  public findDiscountPercent(actualPrice: number, newPrice: number) {
    return ((actualPrice - newPrice) * 100) / actualPrice;
  }
}