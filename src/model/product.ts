import { PurchasableItem } from './purchasableItem';

export class Product extends PurchasableItem {

  constructor() {
    super();
    this.order = 0;
  }

}