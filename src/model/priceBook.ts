import { PurchasableItemPriceInterface } from './purchasableItemPrice.interface';
import {DBBasedEntity} from './dbBasedEntity';

export class PriceBook extends DBBasedEntity {

  public criteria: any; /* Can be PriceBookCriteriaInterface in future */
  public purchasableItems: Array<PurchasableItemPriceInterface>;
  public priority: number;

  constructor() {
    super();
    this.priority = 0;
    this.criteria = {};
    this.purchasableItems = [];
  }

}