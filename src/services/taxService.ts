import {Injectable} from '@angular/core';

@Injectable()
export class TaxService {
  private tax: number = 10;

  public getTax() {
    return this.tax;
  }

  public calculate(price: number): number {
    if(this.tax > 0) {
      let amountToAdd = (this.tax / 100) * price;
      return price + amountToAdd;
    } else {
      return price;
    }
  }
}