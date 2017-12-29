import { DBBasedEntity } from './dbBasedEntity';
import { Sale } from './sale';
import { DBMode, DBModeEnum } from '../metadata/dbMode';

@DBMode(DBModeEnum.Current)
export class Closure extends DBBasedEntity {
  public posId: string;
  public posName: string;
  public storeId: string;
  public storeName: string;
  public openTime: string;
  public closeTime: string;
  public openingAmount: number;
  public closureNumber: string;
  public totalCashIn: number;
  public totalCashOut: number;
  public cashCounted: number;
  public cashDifference: number;
  public ccCounted: number;
  public ccDifference: number;
  public totalCounted: number;
  public totalDifference: number;
  public note: string;
  public sales: Array<Sale>;
  public employeeFullName: string;
  public employeeId: string;

  constructor() {
    super();
    this.cashCounted = 0;
    this.cashDifference = 0;
    this.ccCounted = 0;
    this.ccDifference = 0;
    this.totalCounted = 0;
    this.totalDifference = 0;
  }
}