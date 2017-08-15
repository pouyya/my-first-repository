import {DBBasedEntity} from './dbBasedEntity';

export class AppSettings extends DBBasedEntity {

  public defaultTax: string;
  public taxType: boolean;
  public taxEntity: string;

  constructor() {
    super();
    this.taxType = true;
  }

} 