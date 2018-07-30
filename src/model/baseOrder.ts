import { DBModeEnum, DBMode } from "@simplepos/core/dist/metadata/dbMode";
import { DBBasedEntity } from "@simplepos/core/dist/model/dbBasedEntity";


export enum OrderStatus {
  Received = 'received',
  Ordered = 'ordered',
  Cancelled = 'cancelled'
}

export class OrderedItems {
  public productId: string;
  public quantity: number;
  public price: number;
  public receivedQty?: number;
  public receivedPrice?: number;
}

@DBMode(DBModeEnum.Current)
export abstract class BaseOrder<E extends OrderStatus> extends DBBasedEntity {
  createdAt: string;
  orderNumber: string;
  storeId: string;
  supplierId: string;
  items: OrderedItems[];
  status: E
}