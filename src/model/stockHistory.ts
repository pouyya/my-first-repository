import { DBBasedEntity } from '@simpleidea/simplepos-core/dist/model/dbBasedEntity';
import { DBMode, DBModeEnum } from "@simpleidea/simplepos-core/dist/metadata/dbMode";

 export enum Reason {
  Purchase = 'Purchase',
  NewStock = 'NewStock',
  Return = 'Return',
  Transfer = 'Transfer',
  Adjustment = 'Adjustment',
  InternalUse = 'InternalUse',
  Damaged = 'Damaged',
  OutOfDate = 'OutOfDate',
  Other = 'Other'
}

@DBMode(DBModeEnum.Current)
export class StockHistory extends DBBasedEntity {
  public createdAt: string;
  public createdBy: string;
  public productId: string;
  public value: number;
  public storeId: string;
  public supplyPrice: number;
  public orderId: string;
  public reason: Reason;
  public note: string;
}