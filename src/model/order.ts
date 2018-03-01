import { BaseOrder, OrderStatus } from "./baseOrder";

export class Order extends BaseOrder<OrderStatus> {
 
  public cancelledAt?: string;
  public receivedAt?: string;
}