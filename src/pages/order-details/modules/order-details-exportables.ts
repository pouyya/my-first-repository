import { OrderedItems } from './../../../model/baseOrder';
import { Product } from '../../../model/product';
import { Order } from '../../../model/order';

export enum OrderUIState {
  Unprocessed = 'unprocessed',
  Receive = 'receive',
  Ordered = 'ordered',
  Cancelled = 'cancelled',
  Received = 'received'
}

export class InteractableOrder extends Order {
  UIState: OrderUIState;
}

export class InteractableOrderedProducts extends OrderedItems {
  product: Product;
}

export interface OrderPageCurrentSettings {
  type: OrderUIState;
  title: string;
  btnText: string;
  btnFunc();
  onPageLoad?(): Promise<any>;
}

export abstract class OrderPageSettings {
  [E: string]: OrderPageCurrentSettings
}