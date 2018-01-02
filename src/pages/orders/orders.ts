import { OrderDetails } from './../order-details/order-details';
import { NavController } from 'ionic-angular/navigation/nav-controller';
import _ from 'lodash';
import { OrderService } from './../../services/orderService';
import { OrderStatus, BaseOrder } from './../../model/baseOrder';
import { ReceivedOrder } from './../../model/receivedOrder';
import { Component } from '@angular/core';
import { Order } from '../../model/order';
import { ReceivedOrderService } from '../../services/receivedOrderService';

interface RenderableOrder extends BaseOrder<OrderStatus> {}

@Component({
  selector: 'orders',
  templateUrl: 'orders.html'
})
export class Orders {

  public orders: RenderableOrder[] = [];

  constructor(
    private orderService: OrderService,
    private receivedOrderService: ReceivedOrderService,
    private navCtrl: NavController
  ) {}

  async ionViewDidLoad() {
    let loadOrders: any[] = [
      this.orderService.getAll(),
      this.receivedOrderService.getAll()
    ];

    this.orders = <RenderableOrder[]>_.flatten(await Promise.all(loadOrders));
  }

  public view(order?: RenderableOrder) {
    this.navCtrl.push(OrderDetails, { order: <BaseOrder<OrderStatus>> order || null });
  }

  public search(event) {

  }
}