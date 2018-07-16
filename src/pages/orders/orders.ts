import _ from 'lodash';
import { StoreService } from './../../services/storeService';
import { InventoryModule } from './../../modules/inventoryModule';
import { OrderDetails } from './../order-details/order-details';
import { NavController, InfiniteScroll, LoadingController } from 'ionic-angular';
import { OrderService } from './../../services/orderService';
import { OrderStatus, BaseOrder } from './../../model/baseOrder';
import { Component, NgZone } from '@angular/core';
import { PageModule } from '../../metadata/pageModule';
import { SupplierService } from '../../services/supplierService';
import { SortOptions } from '@simpleidea/simplepos-core/dist/services/baseEntityService';
import { SearchableListing } from "../../modules/searchableListing";
import { Order } from "../../model/order";
import * as moment from "moment-timezone";
import {Utilities} from "../../utility";

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
export class Orders extends SearchableListing<Order>{

  public items: RenderableOrder[] = [];
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
  private stores: any;
  private suppliers: any;

  constructor(
    private storeService: StoreService,
    private supplierService: SupplierService,
    private orderService: OrderService,
    private loading: LoadingController,
    private navCtrl: NavController,
    protected zone: NgZone,
    private utility: Utilities
  ) {
    super(orderService, zone, 'Order');
    this.filter['status'] = null;
    this.options = { sort: [{ _id: SortOptions.DESC }] }
  }

  async ionViewDidEnter() {
    let loader = this.loading.create();
    loader.present();
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
    this.stores = stores;
    this.suppliers = suppliers;

    await this.fetch();
    loader.dismiss();
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

  public async searchByOrderStatus() {
    this.filter.status = <OrderStatus>this.selectedOrderStatus || null;
    this.setDefaultSettings();
    await this.fetchMore();
  }

  public async fetchMore(infiniteScroll?: InfiniteScroll) {
    let orders: RenderableOrder[] = <RenderableOrder[]>await this.loadData();
    orders = this.updateOrderProps(orders);
    this.offset += orders ? orders.length : 0;
    this.zone.run(() => {
      this.items = this.items.concat(orders);
      // this.ordersBackup = this.orders;
      infiniteScroll && infiniteScroll.complete();
    });
  }

  private updateOrderProps(orders) {
    orders.map(order => {
      order.totalCost = (order.status == OrderStatus.Received) ?
        order.items.map(product => product.receivedQty * product.receivedQty).reduce((a, b) => a + b) :
        order.items.map(product => product.quantity * product.price).reduce((a, b) => a + b);

      order.storeId && (order.storeName = this.stores[order.storeId].name);
      order.supplierId && (order.supplierName = this.suppliers[order.supplierId].name);
      return order;
    });
    return orders;
  }

  public async cancelOrder(order: Order, index: number) {
    const isCancel = await this.utility.confirmRemoveItem("Do you really wish to cancel this order!");
    if(!isCancel){
        return;
    }
    order.cancelledAt = moment().utc().format();
    order.status = OrderStatus.Cancelled;
    await this.orderService.update(<Order>_.omit(order, ['UIState']));
    this.items.splice(index, 1);
  }

}