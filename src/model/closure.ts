import { DBBasedEntity } from '@simpleidea/simplepos-core/dist/model/dbBasedEntity';
import { DBMode, DBModeEnum } from '@simpleidea/simplepos-core/dist/metadata/dbMode';
import { Sale } from './sale';

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
  public totalCashMaking: number;
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
    this.totalCashMaking = 0;
  }
}