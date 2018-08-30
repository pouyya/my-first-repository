import { DBBasedEntity } from '@simplepos/core/dist/model/dbBasedEntity';
import { BaseTaxIterface } from './baseTaxIterface';

export class SalesTax extends DBBasedEntity implements BaseTaxIterface {

  public name: string;
  public rate: number;
  public userId: string;

  constructor() {
    super();
  }
}