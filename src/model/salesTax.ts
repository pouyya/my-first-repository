import { DBBasedEntity } from './dbBasedEntity';
import { BaseTaxIterface } from './baseTaxIterface';

export class SalesTax extends DBBasedEntity implements BaseTaxIterface {

  public name: string;
  public rate: number;
  public userId: string;

  constructor() {
    super();
  }
}