import {DBBasedEntity} from './dbBasedEntity';

export class AppSettings extends DBBasedEntity {

  public defaultTax: string;
  public taxType: string;
  public taxEntity: string;

} 