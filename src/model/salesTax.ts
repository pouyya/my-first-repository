import {DBBasedEntity} from './dbBasedEntity';

export class SalesTax extends DBBasedEntity {

  public name: string;
  public rate: number;
  public userId: string;

}