import { DBBasedEntity } from "./dbBasedEntity";

export enum OrderStatus {
  Received = 'received',
  Ordered = 'ordered',
  Cancelled = 'cancelled',
  Completed = 'completed'
}

export class OrderedItems {
  id: string;
  orderNumber: string;
  quantity: number;
  price: number;
}

export abstract class BaseOrder<E extends OrderStatus> extends DBBasedEntity {
  storeId: string;
  items: OrderedItems[];
  status: E
}