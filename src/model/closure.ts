import {DBBasedEntity} from './dbBasedEntity';

export class Closure extends DBBasedEntity {
  public posId: string;
  public posName: string;
  public storeName: string;
  public openTime: Date;
  public closeTime: Date;
  public closureNumber: number;
  public cashMovements: Array<any>;
  public cashCounted: number;
  public cashDifference: number;
  public ccCounted: number;
  public ccDifference: number;
  public totalCounted: number;
  public totalDifference: number;
}