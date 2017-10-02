import { DBBasedEntity } from './dbBasedEntity';

export class AppSettings extends DBBasedEntity {

  public userId: string;
  public defaultTax: string;
  public taxType: boolean;
  public taxEntity: string;
  public trackEmployeeSales: boolean;
  public currentStore: string;
  public currentPos: string;

  constructor() {
    super();
    this.taxType = true;
    this.trackEmployeeSales = false;
  }
} 