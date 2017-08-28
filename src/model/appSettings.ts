import {DBBasedEntity} from './dbBasedEntity';

export class AppSettings extends DBBasedEntity {

  public defaultTax: string;
  public taxType: boolean;
  public taxEntity: string;
  public trackEmployeeSales: boolean;
  public reservedPins: Array<string> = [];

  constructor() {
    super();
    this.taxType = true;
    this.trackEmployeeSales = false;
  }
} 