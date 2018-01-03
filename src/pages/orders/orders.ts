import _ from 'lodash';
import { StoreService } from './../../services/storeService';
import { InventoryModule } from './../../modules/inventoryModule';
import { OrderDetails } from './../order-details/order-details';
import { NavController } from 'ionic-angular/navigation/nav-controller';
import { OrderService } from './../../services/orderService';
import { OrderStatus, BaseOrder } from './../../model/baseOrder';
import { ReceivedOrder } from './../../model/receivedOrder';
import { Component } from '@angular/core';
import { Order } from '../../model/order';
import { ReceivedOrderService } from '../../services/receivedOrderService';
import { PageModule } from '../../metadata/pageModule';
import { SupplierService } from '../../services/supplierService';
interface RenderableOrder extends BaseOrder<OrderStatus> {
  totalCost: number;
  storeName?: string;
  supplierName?: string;
}
@PageModule(() => InventoryModule)
@Component({
  selector: 'orders',
  templateUrl: 'orders.html'
})
export class Orders {

  public orders: RenderableOrder[] = [];

  constructor(
    private storeService: StoreService,
    private supplierService: SupplierService,
    private orderService: OrderService,
    private receivedOrderService: ReceivedOrderService,
    private navCtrl: NavController
  ) { }

  async ionViewDidEnter() {
    let loadEssentials: any[] = [
      async () => {
        let storesHash = {};
        let stores = await this.storeService.getAll();
        stores.forEach(store => {
          storesHash[store._id] = store;
        });
        return storesHash;
      },
      async () => {
        let suppliersHash = {};
        let suppliers = await this.supplierService.getAll();
        suppliers.forEach(supplier => {
          suppliersHash[supplier._id] = supplier;
        });
        return suppliersHash;
      }
    ];

    let [ stores, suppliers ] = await Promise.all(loadEssentials.map(p => p()));
    console.warn(stores)
    console.warn(suppliers);
    let loadOrders: any[] = [
      this.orderService.getAll(),
      this.receivedOrderService.getAll()
    ];

    this.orders = (<RenderableOrder[]>_.flatten(await Promise.all(loadOrders))).map(order => {
      order.totalCost = order.items.map(product => {
        return Number(product.quantity) * Number(product.price);
      }).reduce((a, b) => a + b);
      order.storeId && (order.storeName = stores[order.storeId].name);
      order.supplierId && (order.supplierName = suppliers[order.supplierId].name);
      return order;
    });
    console.warn(this.orders);
  }

  public view(order?: RenderableOrder) {
    this.navCtrl.push(OrderDetails, { order: <BaseOrder<OrderStatus>>order || null });
  }

  public viewOrder() {
    
  }

  public search(event) {

  }
}