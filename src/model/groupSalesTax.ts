import { DBBasedEntity } from './dbBasedEntity';

export class GroupSaleTax extends DBBasedEntity {

  public name: string;
  public userId: string;
  public salesTaxes: Array<{ _id: string }>;
  public isDefault: boolean;
  public rate?: number;

  constructor() {
    super();
    this.salesTaxes = [];
    this.isDefault = false;
  }

}