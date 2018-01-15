import { Injectable } from "@angular/core";

@Injectable()
export class CalculatorService {
  constructor() {

  }

  public calcItemDiscount(price: number, discount: number) {
    return discount > 0 ? price - ((discount / 100) * price) : price;
  }

  public findDiscountPercent(originalPrice: number, newPrice: number) {
    return ((originalPrice - newPrice) * 100) / originalPrice;
  }
}