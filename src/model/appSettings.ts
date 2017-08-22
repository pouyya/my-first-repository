import {DBBasedEntity} from './dbBasedEntity';

export class AppSettings extends DBBasedEntity {

  public defaultTax: string;
  public taxType: boolean;
  public taxEntity: string;
  public trackStaffSales: boolean;

  constructor() {
    super();
    this.taxType = true;
    this.trackStaffSales = false;
  }
} 