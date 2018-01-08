import { DBBasedEntity } from "./dbBasedEntity";
import { DBMode, DBModeEnum } from "../metadata/dbMode";

export enum OrderStatus {
  Unprocessed = 'unprocessed',
  Received = 'received',
  Ordered = 'ordered',
  Cancelled = 'cancelled',
  Completed = 'completed'
}

export class OrderedItems {
  id: string;
  quantity: number;
  price: number;
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