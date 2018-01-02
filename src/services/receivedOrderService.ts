import { ReceivedOrder } from './../model/receivedOrder';
import { BaseEntityService } from "./baseEntityService";

export class ReceivedOrderService extends BaseEntityService<ReceivedOrder> {

  constructor() {
    super(ReceivedOrder);
  }

}