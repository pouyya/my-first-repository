import { Product } from './product';
import { BasketItemInterface } from './basketItemInterface';

export class BasketProduct extends Product implements BasketItemInterface {

  public finalPrice: number;
  public discount: number;
  public notes: string;
  public quantity: number;

  constructor(discount?: number, quantity?: number) {
    super();
    this.discount = discount || 0;
    this.quantity = quantity || 1;
  }

}