import {DBBasedEntity} from './dbBasedEntity';

export class PriceBook extends DBBasedEntity {

  purchasableItemId: string;
  salesTaxId: string;
  supplyPrice: number;
  markup: number;
  retailPrice: number;
  priority: number;

  constructor() {
    super();
    this.priority = 0;
    this.retailPrice = 0;
  }

}