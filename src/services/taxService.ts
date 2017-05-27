import {Injectable} from '@angular/core';

@Injectable()
export class TaxService {
  private tax: number = 10;

  public getTax() {
    return this.tax;
  }

  public calculate(price: number): number {
    let amountToAdd = (this.tax / 100) * price;
    return price + amountToAdd;
  }
}