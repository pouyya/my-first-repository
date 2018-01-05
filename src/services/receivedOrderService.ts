import { ReceivedOrder } from './../model/receivedOrder';
import { BaseEntityService } from "./baseEntityService";

export class ReceivedOrderService extends BaseEntityService<ReceivedOrder> {

  constructor() {
    super(ReceivedOrder);
  }

  public async getByOrderId(orderId: string): Promise<ReceivedOrder> {
    let orders = await this.findBy({
      selector: { orderId }
    });

    return orders.length > 0 ? orders.shift() : null;
  }
}