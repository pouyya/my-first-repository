import _ from 'lodash';
import { StoreService } from './../../services/storeService';
import { InventoryModule } from './../../modules/inventoryModule';
import { OrderDetails } from './../order-details/order-details';
import { NavController } from 'ionic-angular/navigation/nav-controller';
import { OrderService } from './../../services/orderService';
import { OrderStatus, BaseOrder } from './../../model/baseOrder';
import { Component } from '@angular/core';
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
  public ordersBackup: RenderableOrder[] = [];
  public selectedOrderStatus: string = '';
  public orderStatuses: { value: string, text: string }[] = [
    { value: '', text: 'All' },
    { value: OrderStatus.Ordered, text: 'Ordered' },
    { value: OrderStatus.Cancelled, text: 'Cancelled' },
    { value: OrderStatus.Received, text: 'Received' }
  ];
  public labels: { [E: string]: { text: string, color: string } } = {
    [OrderStatus.Ordered]: { text: 'ORDERED', color: 'primary' },
    [OrderStatus.Cancelled]: { text: 'CANCELLED', color: 'danger' },
    [OrderStatus.Received]: { text: 'RECEIVED', color: 'secondary' }
  }

  constructor(
    private storeService: StoreService,
    private supplierService: SupplierService,
    private orderService: OrderService,
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

    let [stores, suppliers] = await Promise.all(loadEssentials.map(p => p()));
    let loadOrders: any[] = [this.orderService.getAll()];

    this.orders = (<RenderableOrder[]>_.flatten(await Promise.all(loadOrders))).map(order => {
      order.totalCost = (order.status == OrderStatus.Received) ?
        order.items.map(product => product.receivedQty * product.receivedQty).reduce((a, b) => a + b) :
        order.items.map(product => product.quantity * product.price).reduce((a, b) => a + b);

      order.storeId && (order.storeName = stores[order.storeId].name);
      order.supplierId && (order.supplierName = suppliers[order.supplierId].name);
      return order;
    });
    this.ordersBackup = this.orders;
  }

  public view(order?: RenderableOrder) {
    this.navCtrl.push(OrderDetails, {
      order: order ? <BaseOrder<OrderStatus>>_.omit(order, [
        'totalCost',
        'supplierName',
        'storeName'
      ]) : null
    });
  }

  public search(event) {
    this.orders = this.ordersBackup;
    let val = event.target.value;

    if (val && val.trim() != '') {
      this.orders = this.orders.filter((item) => {
        return (item.orderNumber.indexOf(val) > -1);
      })
    }
  }

  public searchByOrderStatus() {
    this.orders = this.ordersBackup;
    if (this.selectedOrderStatus != '') {
      this.orders = this.orders.filter((item) => {
        return item.status == this.selectedOrderStatus;
      });
    } else {
      this.orders = this.ordersBackup;
    }
  }
}