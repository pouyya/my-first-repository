import { BaseOrder, OrderStatus } from "./baseOrder";

export class Order extends BaseOrder<OrderStatus> {

  private _status: OrderStatus;

  set status(E: OrderStatus) {
    E != OrderStatus.Received && (this._status = E);
  }

  get status(): OrderStatus {
    return this._status;
  }

  constructor() {
    super();
    this.status = OrderStatus.Completed;
  }
}