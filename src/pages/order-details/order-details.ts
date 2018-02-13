import _ from 'lodash';
import * as moment from 'moment-timezone';
import { StockHistory, Reason } from './../../model/stockHistory';
import { OrderService } from './../../services/orderService';
import { PriceBook } from './../../model/priceBook';
import { AddSupplierAndStore } from './modals/addSupplierAndStore/addSupplierAndStore';
import { StoreService } from './../../services/storeService';
import { Component, ChangeDetectorRef } from '@angular/core';
import { SupplierService } from '../../services/supplierService';
import { Supplier } from '../../model/supplier';
import { Store } from '../../model/store';
import { ProductService } from '../../services/productService';
import { Product } from '../../model/product';
import { ProductsSelector } from './modals/products-selector/products-selector';
import { OrderedItems, OrderStatus } from '../../model/baseOrder';
import { PriceBookService } from '../../services/priceBookService';
import { Order } from '../../model/order';
import { FountainService } from '../../services/fountainService';
import { StockHistoryService } from '../../services/stockHistoryService';
import {
  NavController,
  NavParams,
  LoadingController,
  ModalController,
  AlertController,
  ToastController
} from 'ionic-angular';
import {
  OrderUIState,
  InteractableOrder,
  InteractableOrderedProducts,
  OrderPageCurrentSettings,
  OrderPageSettings
} from './modules/order-details-exportables';

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

  public order: InteractableOrder = null;
  public orderBackup: InteractableOrder = null;
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
    private stockHistoryService: StockHistoryService,
    private fountainService: FountainService,
    private priceBookService: PriceBookService
  ) {
    this.cdr.detach();
    let order = <Order>navParams.get('order');
    if (!order) {
      this.order = <InteractableOrder>new Order();
      this.order.UIState = OrderUIState.Unprocessed;
      this.order.items = [];
    } else {
      this.order = <InteractableOrder>order;
      switch (this.order.status) {
        case OrderStatus.Received:
          this.order.UIState = OrderUIState.Received;
          break;
        case OrderStatus.Ordered:
          this.order.UIState = OrderUIState.Ordered;
          break;
        case OrderStatus.Cancelled:
          this.order.UIState = OrderUIState.Cancelled;
          break;
      }
    }
    this.pageSettings = {
      [OrderUIState.Unprocessed]: {
        type: OrderUIState.Unprocessed,
        title: 'Create Order',
        btnText: 'Place Order',
        btnFunc: this.placeOrder.bind(this),
        onPageLoad: this.onCreateOrderPageLoad.bind(this)
      },
      [OrderUIState.Ordered]: {
        type: OrderUIState.Ordered,
        title: `Order ${this.order.orderNumber}`,
        btnText: 'Receive Stock',
        btnFunc: this.receiveOrder.bind(this),
        onPageLoad: this.onOrderPageLoad.bind(this)
      },
      [OrderUIState.Cancelled]: {
        type: OrderUIState.Cancelled,
        title: `Order ${this.order.orderNumber}`,
        btnText: 'Close Order',
        btnFunc: this.closeOrder.bind(this),
        onPageLoad: this.onOrderPageLoad.bind(this)
      },
      [OrderUIState.Receive]: {
        type: OrderUIState.Receive,
        title: `Receive Order ${this.order.orderNumber}`,
        btnText: 'Confirm Order',
        btnFunc: this.confirmOrder.bind(this)
      },
      [OrderUIState.Received]: {
        type: OrderUIState.Received,
        title: `Completed Order ${this.order.orderNumber}`,
        btnText: 'Close Order',
        btnFunc: this.closeOrder.bind(this),
        onPageLoad: this.onOrderPageLoad.bind(this)
      }
    };

    this.currentSettings = this.pageSettings[this.order.UIState];
  }

  async ionViewDidLoad() {
    let loader = this.loadingCtrl.create({ content: 'Loading your Order...' });
    await loader.present();
    await this.currentSettings.onPageLoad();
    loader.dismiss();
  }

  public addProducts() {
    let modal = this.modalCtrl.create(ProductsSelector, {
      products: this.products,
      selectedProductIds: this.orderedProducts.length > 0 ? <string[]>this.orderedProducts
        .map(item => item.productId) : null
    });
    modal.onDidDismiss((res: { products: Product[], productsLeft: number }) => {
      if (res && res.products) {
        this.disableAddProductsBtn = res.productsLeft <= 0;
        this.orderedProducts = this.orderedProducts.concat(res.products.map(product => {
          let purchasableItem = this.pricebook.purchasableItems.find(item => item.id === product._id);
          let iProduct = new InteractableOrderedProducts();
          iProduct.productId = product._id;
          iProduct.product = product;
          iProduct.quantity = 1;
          iProduct.price = purchasableItem ? Number(purchasableItem.supplyPrice) : 0;
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

  public calculateProductPrice(product: InteractableOrderedProducts): number {
    let sum: number = (this.currentSettings.type === OrderUIState.Received || this.currentSettings.type === OrderUIState.Receive) ?
      product.receivedQty * product.receivedPrice : product.quantity * product.price;
    return sum;
  }

  public calculateTotal() {
    this.totalCost = _.sum(<number[]>this.orderedProducts.map(this.calculateProductPrice.bind(this)));
  }

  public async placeOrder() {
    this.order.orderNumber = await this.fountainService.getOrderNumber();
    this.order.storeId = this.store._id;
    this.order.supplierId = this.supplier._id;
    this.order.status = OrderStatus.Ordered;
    this.order.createdAt = moment().utc().format();
    this.order.items = <OrderedItems[]>this.orderedProducts.map(product => {
      return <OrderedItems>{
        productId: product.productId,
        price: Number(product.price),
        quantity: Number(product.quantity)
      };
    });
    await this.orderService.add(<Order> _.omit(this.order, [ 'UIState' ]));
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
            this.orderService.update(<Order>_.omit(this.order, ['UIState'])).then(() => {
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
    this.orderBackup = _.cloneDeep(this.order);
    this.order.UIState = OrderUIState.Receive;
    this.orderedProducts = this.orderedProducts.map(product => {
      product.receivedQty = Number(product.quantity);
      product.receivedPrice = Number(product.price);
      return product;
    });
    this.currentSettings = this.pageSettings[this.order.UIState];
    this.calculateTotal();
  }

  public async confirmOrder() {
    let loader = this.loadingCtrl.create({ content: 'Confirming Order...' });
    await loader.present();
    this.order.status = OrderStatus.Received;
    this.order.receivedAt = moment().utc().format();
    this.order.items = this.orderedProducts.map(product => {
      return <OrderedItems>{
        productId: product.productId,
        price: product.price,
        quantity: product.quantity,
        receivedQty: product.receivedQty,
        receivedPrice: product.receivedPrice
      };
    });
    try {
      await this.orderService.update(<Order>_.omit(this.order, ['UIState']));
      /** now make entries to stock */
      let addToStock: any[] = this.order.items.map(item => {
        let stock = new StockHistory();
        stock.reason = Reason.NewStock;
        stock.storeId = this.store._id;
        stock.productId = item.productId;
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
      this.pricebook = await this.priceBookService.getDefault();
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
      this.navCtrl.push(AddSupplierAndStore, { callback: pushCallback });
    } catch (err) {
      this.bounceBackOnError(err);
    }
  }

  private async onOrderPageLoad() {
    try {
      let [supplier, store, products] = [
        await this.supplierService.get(this.order.supplierId),
        await this.storeService.get(this.order.storeId),
        await this.productService.getByCategoryIds(this.order.items.map(item => item.productId))
      ];
      store && (this.store = store);
      supplier && (this.supplier = supplier);
      products.length > 0 && (this.products = products);
      this.orderedProducts = <InteractableOrderedProducts[]>this.order.items.map(item => {
        let iProduct = new InteractableOrderedProducts();
        iProduct.price = Number(item.price);
        iProduct.productId = item.productId;
        iProduct.quantity = Number(item.quantity);
        iProduct.product = _.find(this.products, { _id: item.productId });

        item.receivedPrice && (iProduct.receivedPrice = item.receivedPrice);
        item.receivedQty && (iProduct.receivedQty = item.receivedQty);
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

  private bounceBackOnError(err) {
    this.toastCtrl.create({
      message: 'Unable to load order',
      duration: 3000
    }).present();
    console.error(err);
    this.navCtrl.pop();
  }
}