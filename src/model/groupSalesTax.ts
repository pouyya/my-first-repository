import { DBBasedEntity } from '@simplepos/core/dist/model/dbBasedEntity';
import { BaseTaxIterface } from './baseTaxIterface';

export class GroupSaleTax extends DBBasedEntity implements BaseTaxIterface {

  public name: string;
  public userId: string;
  public salesTaxes: Array<{ _id: string }>;
  public rate?: number;

  constructor() {
    super();
    this.salesTaxes = [];
  }

}