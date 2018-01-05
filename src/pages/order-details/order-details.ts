import _ from 'lodash';
import * as moment from 'moment-timezone';
import { StockHistory, Reason } from './../../model/stockHistory';
import { ReceivedOrderService } from './../../services/receivedOrderService';
import { OrderService } from './../../services/orderService';
import { PriceBook } from './../../model/priceBook';
import { AddSupplierAndStore } from './modals/addSupplierAndStore/addSupplierAndStore';
import { StoreService } from './../../services/storeService';
import { NavController, NavParams, LoadingController, ModalController, AlertController, ToastController } from 'ionic-angular';
import { Component, ChangeDetectorRef } from '@angular/core';
import { SupplierService } from '../../services/supplierService';
import { Supplier } from '../../model/supplier';
import { Store } from '../../model/store';
import { ProductService } from '../../services/productService';
import { Product } from '../../model/product';
import { AddProducts } from './modals/addProducts/addProducts';
import { OrderedItems, OrderStatus } from '../../model/baseOrder';
import { PriceBookService } from '../../services/priceBookService';
import { Order } from '../../model/order';
import { FountainService } from '../../services/fountainService';
import { ReceivedOrder } from '../../model/receivedOrder';
import { StockHistoryService } from '../../services/stockHistoryService';

class InteractableOrderedProducts extends OrderedItems {
  product: Product;
  receivedQty?: number;
}

interface OrderPageCurrentSettings {
  type: OrderStatus;
  title: string;
  btnText: string;
  btnFunc();
  onPageLoad?(): Promise<any>;
}

abstract class OrderPageSettings {
  [E: string]: OrderPageCurrentSettings
}

@Component({
  selector: 'order-details',
  templateUrl: 'order-details.html',
  styles: [`
    .center-message {
      text-align: center;
      font-size: 40px;
      font-weight: bold;
    }
    #cancel-order {
      color: red;
    }
  `]
})
export class OrderDetails {

  public order: Order = null;
  public receivedOrder: ReceivedOrder = null;
  public totalCost: number = 0
  public supplier: Supplier = null;
  public store: Store = null;
  public products: Product[] = [];
  public orderedProducts: InteractableOrderedProducts[] = [];
  public pageSettings: OrderPageSettings = {};
  public currentSettings: OrderPageCurrentSettings;
  public disableAddProductsBtn: boolean = false;
  private pricebook: PriceBook;
  
  constructor(
    private navParams: NavParams,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private cdr: ChangeDetectorRef,
    private supplierService: SupplierService,
    private productService: ProductService,
    private storeService: StoreService,
    private orderService: OrderService,
    private receivedOrderService: ReceivedOrderService,
    private stockHistoryService: StockHistoryService,
    private fountainService: FountainService,
    private priceBookService: PriceBookService
  ) {
    this.cdr.detach();
    let order = navParams.get('order');
    if (!order) {
      this.order = new Order();
      this.order.status = OrderStatus.Unprocessed;
      this.order.items = [];
    } else {
      this.order = order;
    }
    this.pageSettings = {
      [OrderStatus.Unprocessed]: {
        type: OrderStatus.Unprocessed,
        title: 'Create Order',
        btnText: 'Place Order',
        btnFunc: this.placeOrder.bind(this),
        onPageLoad: this.onCreateOrderPageLoad.bind(this)
      },
      [OrderStatus.Ordered]: {
        type: OrderStatus.Ordered,
        title: `Order ${this.order.orderNumber}`,
        btnText: 'Receive Stock',
        btnFunc: this.receiveOrder.bind(this),
        onPageLoad: this.onOrderPageLoad.bind(this)
      },
      [OrderStatus.Cancelled]: {
        type: OrderStatus.Cancelled,
        title: `Order ${this.order.orderNumber}`,
        btnText: 'Close Order',
        btnFunc: this.closeOrder.bind(this),
        onPageLoad: this.onCancelledOrderPageLoad.bind(this)
      },
      [OrderStatus.Received]: {
        type: OrderStatus.Received,
        title: `Receive Order ${this.order.orderNumber}`,
        btnText: 'Confirm Order',
        btnFunc: this.confirmOrder.bind(this)
      },
      [OrderStatus.Completed]: {
        type: OrderStatus.Completed,
        title: 'Completed Order ${this.order.orderNumber}',
        btnText: 'Close Order',
        btnFunc: this.closeOrder.bind(this),
        onPageLoad: this.onCompletedOrderPageLoad.bind(this)
      }
    };

    this.currentSettings = this.pageSettings[this.order.status];
  }

  async ionViewDidLoad() {
    let loader = this.loadingCtrl.create({ content: 'Loading your Order...' });
    await loader.present();
    await this.currentSettings.onPageLoad();
    loader.dismiss();
  }

  public addProducts() {
    let modal = this.modalCtrl.create(AddProducts, {
      products: this.products,
      selectedProductIds: this.orderedProducts.length > 0 ? <string[]> this.orderedProducts.map(item => item.id) : null
    });
    modal.onDidDismiss((res: { products: Product[], productsLeft: number }) => {
      if (res.products) {
        this.disableAddProductsBtn = res.productsLeft <= 0;
        this.orderedProducts = this.orderedProducts.concat(res.products.map(product => {
          let purchasableItem = this.pricebook.purchasableItems.find(item => item.id === product._id);
          let iProduct = new InteractableOrderedProducts();
          iProduct.id = product._id;
          iProduct.product = product;
          iProduct.quantity = 1;
          iProduct.price = purchasableItem ? purchasableItem.supplyPrice : 0;
          return iProduct;
        }));
        this.calculateTotal();
      }
    })
    modal.present();
  }

  public removeProduct(index: number) {
    this.orderedProducts.splice(index, 1);
    this.disableAddProductsBtn = false;
    this.calculateTotal();
  }

  public calculateTotal() {
    this.totalCost = this.orderedProducts.length > 0 ? this.orderedProducts.map(product => {
      let qtyProp = this.currentSettings.type === OrderStatus.Received 
      || this.currentSettings.type === OrderStatus.Completed ? 'receivedQty' : 'quantity';
      return Number(product[qtyProp]) * Number(product.price);
    }).reduce((a, b) => a + b) : 0;
  }

  public async placeOrder() {
    this.order.orderNumber = await this.fountainService.getOrderNumber();
    this.order.storeId = this.store._id;
    this.order.supplierId = this.supplier._id;
    this.order.status = OrderStatus.Ordered;
    this.order.createdAt = moment().utc().format();
    this.order.items = <OrderedItems[]>this.orderedProducts.map(product => {
      return <OrderedItems> {
        id: product.id,
        price: product.price,
        quantity: product.quantity
      };
    });
    await this.orderService.add(this.order);
    this.navCtrl.pop();
    return;
  }

  public async cancelOrder() {
    let confirm = this.alertCtrl.create({
      title: 'Do you really wish to cancel this order ?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            let toast = this.toastCtrl.create({ duration: 3000 });
            this.order.cancelledAt = moment().utc().format();
            this.order.status = OrderStatus.Cancelled;
            this.orderService.add(this.order).then(() => {
              toast.setMessage('Order has been cancelled!');
            }).catch(err => {
              console.error(new Error(err));
              toast.setMessage('Error! Unable to cancel order!');
            }).then(() => {
              toast.present();
              this.navCtrl.pop();
            });
          }
        },
        'No' /** Do not cancel */
      ]
    });
    confirm.present();
  }

  public receiveOrder() {
    this.receivedOrder = new ReceivedOrder();
    this.receivedOrder.orderId = this.order._id;
    this.receivedOrder.storeId = this.order.storeId;
    this.receivedOrder.supplierId = this.order.supplierId;
    this.receivedOrder.items = [];
    this.receivedOrder.createdAt = moment().utc().format();
    this.orderedProducts = this.orderedProducts.map(product => {
      product.receivedQty = Number(product.quantity);
      return product;
    });
    this.currentSettings = this.pageSettings[this.receivedOrder.status];
    this.calculateTotal();
  }

  public async confirmOrder() {
    let loader = this.loadingCtrl.create({ content: 'Confirming Order...' });
    await loader.present();
    this.receivedOrder.items = this.orderedProducts.map(product => {
      return <OrderedItems>{
        id: product.id,
        price: Number(product.price),
        quantity: Number(product.receivedQty)
      };
    });
    try {
      await this.receivedOrderService.add(this.receivedOrder);
      this.order.status = OrderStatus.Completed;
      await this.orderService.update(this.order);
      /** make entries to stock */
      let addToStock: any[] = this.order.items.map(item => {
        let stock = new StockHistory();
        stock.reason = Reason.NewStock;
        stock.productId = item.id;
        stock.supplyPrice = Number(item.price);
        stock.value = Number(item.quantity);
        stock.createdAt = moment().utc().format();
        stock.orderId = this.order._id;
        return this.stockHistoryService.add(stock);
      });
      await Promise.all(addToStock);
      loader.dismiss();
      this.toastCtrl.create({
        message: 'You ordered has been received. Items added to current stock.',
        duration: 3000
      }).present();
      this.navCtrl.pop();
      return;
    } catch (err) {
      throw new Error(err);
    }
  }

  public closeOrder() {
    this.navCtrl.pop();
  }

  private async onCreateOrderPageLoad() {
    try {
      let loadEssentials: any[] = [
        this.supplierService.getAll(),
        this.storeService.getAll(),
        this.priceBookService.getDefault()
      ];
  
      let [suppliers, stores, pricebook] = await Promise.all(loadEssentials);
      this.pricebook = pricebook;
  
      this.cdr.reattach();
  
      let pushCallback: Function = async params => {
        if (params && params.supplier && params.store) {
          this.supplier = params.supplier;
          this.store = params.store;
          this.products = await this.productService.getAllBySupplier(this.supplier._id);
        } else {
          this.toastCtrl.create({
            message: 'Error! Please select a Supplier and Store',
            duration: 3000
          }).present();
          this.navCtrl.pop();
        }
        return;
      }
      this.navCtrl.push(AddSupplierAndStore, { suppliers, stores, callback: pushCallback });
    } catch (err) {
      this.bounceBackOnError(err);
    }
  }

  private async onOrderPageLoad() {
    try {
      let loadEssentials: any[] = [
        this.supplierService.get(this.order.supplierId),
        this.storeService.get(this.order.storeId),
        this.productService.getByIds(this.order.items.map(item => item.id))
      ];
      let [supplier, store, products] = await Promise.all(loadEssentials);
      store && (this.store = store);
      supplier && (this.supplier = store);
      products.length > 0 && (this.products = products);
      this.orderedProducts = this.order.items.map(item => {
        let iProduct = new InteractableOrderedProducts();
        iProduct.price = item.price;
        iProduct.id = item.id;
        iProduct.quantity = item.quantity;
        iProduct.product = _.find(this.products, { _id: item.id });
        return iProduct;
      });
      this.calculateTotal();
      this.cdr.reattach();
      return;
    } catch (err) {
      this.cdr.reattach();
      this.bounceBackOnError(err);
    }
  }

  private async onCancelledOrderPageLoad() {
    await this.onOrderPageLoad();
  }

  private async onCompletedOrderPageLoad() {
    try {
      await this.onOrderPageLoad();
      this.receivedOrder = await this.receivedOrderService.getByOrderId(this.order._id);
      this.order.createdAt = this.receivedOrder.createdAt;
      this.orderedProducts = <InteractableOrderedProducts[]> this.receivedOrder.items.map(item => {
        let order = _.find(this.order.items, { id: item.id });
        let iProduct = new InteractableOrderedProducts();
        iProduct.price = item.price;
        iProduct.quantity = order.quantity;
        iProduct.receivedQty = item.quantity;
        iProduct.product = _.find(this.products, { _id: item.id });
        return iProduct;
      });
    } catch (err) {
      this.bounceBackOnError(err);
    }
  }

  private bounceBackOnError(err) {
    this.toastCtrl.create({
      message: 'Unable to load order',
      duration: 3000
    }).present();
    console.error(err);
    this.navCtrl.pop();
  }
}