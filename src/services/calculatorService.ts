import { Injectable } from "@angular/core";

@Injectable()
export class CalculatorService {
  constructor() {

  }

  public calcItemDiscount(price: number, discount: number) {
    if(discount == 0) return price;

    return price - ((discount / 100) * price);
  }

  public findDiscountPercent(originalPrice: number, newPrice: number) {
    return ((originalPrice - newPrice) * 100) / originalPrice;
  }
}