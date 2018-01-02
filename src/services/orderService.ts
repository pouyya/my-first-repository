import { BaseEntityService } from "./baseEntityService";
import { Order } from "../model/order";

export class OrderService extends BaseEntityService<Order> {

  constructor() {
    super(Order);
  }

}