import { BaseEntityService } from "@simpleidea/simplepos-core/dist/services/baseEntityService";
import { Order } from "../model/order";
import { OrderStatus } from "../model/baseOrder";

export class OrderService extends BaseEntityService<Order> {

  constructor() {
    super(Order);
  }

  /**
   * Retrieved Completed Order
   * @param orderId 
   */
  public async getReceivedOrder(orderId: string) {
    let order = await this.findBy({
      selector: {
        orderId,
        status: OrderStatus.Received,
      }
    });

    return order.length > 0 ? order.shift() : null;
  }

}