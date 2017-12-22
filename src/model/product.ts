import { PurchasableItem } from './purchasableItem';

export class Product extends PurchasableItem {

  public stockControl: boolean;

  constructor() {
    super();
    this.order = 0;
    this.stockControl = false;
  }

}