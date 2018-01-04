import _ from 'lodash';
import { StoreService } from './../../services/storeService';
import { InventoryModule } from './../../modules/inventoryModule';
import { OrderDetails } from './../order-details/order-details';
import { NavController } from 'ionic-angular/navigation/nav-controller';
import { OrderService } from './../../services/orderService';
import { OrderStatus, BaseOrder } from './../../model/baseOrder';
import { Component } from '@angular/core';
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
  public labels: { [E: string]: { text: string, color: string } } = {
    [OrderStatus.Ordered]: { text: 'ORDERED', color: 'primary' },
    [OrderStatus.Cancelled]: { text: 'CANCELLED', color: 'danger' },
    [OrderStatus.Received]: { text: 'RECEIVED', color: 'secondary' },
    [OrderStatus.Completed]: { text: 'RECEIVED', color: 'danger' }
  }

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
    let loadOrders: any[] = [
      this.orderService.getAll(),
      // this.receivedOrderService.getAll()
    ];

    this.orders = (<RenderableOrder[]>_.flatten(await Promise.all(loadOrders))).map(order => {
      order.totalCost = order.items.map(product => {
        return Number(product.quantity) * Number(product.price);
      }).reduce((a, b) => a + b);
      order.storeId && (order.storeName = stores[order.storeId].name);
      order.supplierId && (order.supplierName = suppliers[order.supplierId].name);
      return order;
    });
  }

  public view(order?: RenderableOrder) {
    if((order && order.status != OrderStatus.Completed) || !order) {
      this.navCtrl.push(OrderDetails, { order: order ? <BaseOrder<OrderStatus>>_.omit(order, [
        'totalCost',
        'supplierName',
        'storeName'
      ]) : null });
    }
  }

  public search(event) {

  }
}