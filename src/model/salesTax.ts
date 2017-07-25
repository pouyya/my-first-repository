import { DBBasedEntity } from './dbBasedEntity';

export class SalesTax extends DBBasedEntity {

  public name: string;
  public rate: number;
  public userId: string;
  public isDefault: boolean;

  constructor() {
    super();
    this.isDefault = false;
  }
}