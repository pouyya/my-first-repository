import {DBBasedEntity} from './dbBasedEntity';

export class Store extends DBBasedEntity {

  public name: string;
  public address: string;
  public orderNumPrefix: string;
  public orderNum: number;
  public street: string;
  public suburb?: string;
  public city?: string;
  public postCode?: string;
  public state: string;
  public country: string;
  public email: string;
  public phone: string;
  public printerIP: string;
  public printerPort: number;
  public taxFileNumber: string;
  public twitter?: string;
  public timezone?: string;
  public supplierReturnPrefix?: string;
  public supplierReturnNum?: number;
  public saleNumberPrefix: string;
  public saleLastNumber: number = 0;
  public defaultSaleTaxId: string;
}