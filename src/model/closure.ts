import {DBBasedEntity} from './dbBasedEntity';

export class Closure extends DBBasedEntity {
  public posId: string;
  public posName: string;
  public storeName: string;
  public openTime: string;
  public closeTime: string;
  public closureNumber: number;
  public cashMovements: Array<any>;
  public cashCounted: number;
  public cashDifference: number;
  public ccCounted: number;
  public ccDifference: number;
  public totalCounted: number;
  public totalDifference: number;
  public note: string;

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