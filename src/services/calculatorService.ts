import { TaxService } from './taxService';
import { Injectable } from "@angular/core";

@Injectable()
export class CalculatorService {
  constructor(private taxService: TaxService) {

  }
  /**
   * Calculate Total and Taxed Total
   * @param total
   * @param amount 
   * @param action 
   */
  public calcTotalWithTax(total: number, amount: number, action: string) {
    switch (action) {
      case 'add': total += amount; break;
      case 'subtract': total -= amount; break;
      default:
        throw new Error('Invalid Operator!');
    }

    return {
      total,
      totalWithTax: this.taxService.getTax() > 0 ?
        this.taxService.calculate(total) : total
    };
  }

  /**
   * Calculate Discount of Item(s)
   * @param discount
   * @param price 
   * @param quantity 
   */
  public calcItemDiscount(discount, price: number, quantity: number) {
    var prices: Array<number> = [];
    var price: number = price;

    for (let i = 1; i <= quantity; i++) {
      prices.push(price - ((parseInt(discount) / 100) * price));
    }

    return prices.reduce((a, b) => a + b);
  }
}