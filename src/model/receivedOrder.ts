import { BaseOrder, OrderStatus } from "./baseOrder";

export class ReceivedOrder extends BaseOrder<OrderStatus.Received> {
  public orderId: string;

  constructor() {
    super();
    this.status = OrderStatus.Received;
  }
}