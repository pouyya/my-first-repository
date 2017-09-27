import { PurchasableItemPriceInterface } from './purchasableItemPrice.interface';
import { PriceBookCriteria } from './PriceBookCriteria';
import { DBBasedEntity } from './dbBasedEntity';

export interface PriceBookCriteriaInterface {
  provider: string;
  criteria: PriceBookCriteria;
}

export class PriceBook extends DBBasedEntity {

  public name: string;
  public criteria: Array<PriceBookCriteriaInterface>;
  public purchasableItems: Array<PurchasableItemPriceInterface>;
  public priority: number;

  constructor() {
    super();
    this.priority = 0;
    this.criteria = [];
    this.purchasableItems = [];
  }

}