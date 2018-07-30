import { PurchasableItemPriceInterface } from './purchasableItemPrice.interface';
import { DBBasedEntity } from '@simplepos/core/dist/model/dbBasedEntity';

export interface PriceBookCriteriaInterface {
  provider: string;
  criteria: any
}

export class PriceBook extends DBBasedEntity {

  public name: string;
  public criteria: Array<PriceBookCriteriaInterface>;
  public purchasableItems: Array<PurchasableItemPriceInterface>;
  public priority: number;
  public validFrom: Date;
  public validTo: Date;
  public createdAt: Date;

  constructor() {
    super();
    this.priority = 1;
    this.criteria = [];
    this.purchasableItems = [];
    this.validFrom = new Date();
    this.validTo= new Date();
  }

}