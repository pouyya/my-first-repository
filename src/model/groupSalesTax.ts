import { DBBasedEntity } from './dbBasedEntity';

export class GroupSaleTax extends DBBasedEntity {

  public name: string;
  public salesTaxes: Array<{ _id: string }>;

  constructor() {
    super();
    this.salesTaxes = [];
  }

}