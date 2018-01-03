import _ from 'lodash';
import { OrderService } from './../../services/orderService';
import { PriceBook } from './../../model/priceBook';
import { AddSupplierAndStore } from './modals/addSupplierAndStore/addSupplierAndStore';
import { StoreService } from './../../services/storeService';
import { NavController, NavParams, LoadingController, ModalController } from 'ionic-angular';
import { Component } from '@angular/core';
import { SupplierService } from '../../services/supplierService';
import { Supplier } from '../../model/supplier';
import { Store } from '../../model/store';
import { ProductService } from '../../services/productService';
import { Product } from '../../model/product';
import { AddProducts } from './modals/addProducts/addProducts';
import { OrderedItems, BaseOrder, OrderStatus } from '../../model/baseOrder';
import { PriceBookService } from '../../services/priceBookService';
import { Order } from '../../model/order';
import { FountainService } from '../../services/fountainService';

class InteractableOrderedProducts extends OrderedItems {
  product: Product
}

interface OrderPageCurrentSettings {
  title: string;
  btnFunc();
  onPageLoad(): Promise<any>;
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
  `]
})
export class OrderDetails {

  public order: Order;
  public totalCost: number = 0
  public supplier: Supplier = null;
  public store: Store = null;
  public products: Product[] = [];
  public orderedProducts: InteractableOrderedProducts[] = [];
  public pageSettings: OrderPageSettings = {};
  public currentSettings: OrderPageCurrentSettings;
  private pricebook: PriceBook;

  constructor(
    private navParams: NavParams,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    private supplierService: SupplierService,
    private productService: ProductService,
    private storeService: StoreService,
    private orderService: OrderService,
    private fountainService: FountainService,
    private priceBookService: PriceBookService
  ) {
    this.order = navParams.get('order');
    if (!this.order) {
      this.order = new Order();
      this.order.status = OrderStatus.Unprocessed;
      this.order.items = [];
    }
    this.pageSettings = {
      [OrderStatus.Unprocessed]: {
        title: 'Create Order',
        btnFunc: this.placeOrder.bind(this),
        onPageLoad: this.onCreateOrderPageLoad.bind(this)
      },
      [OrderStatus.Ordered]: {
        title: `Order ${this.order.orderNumber}`,
        btnFunc: this.receiveOrder.bind(this),
        onPageLoad: this.onOrderPageLoad.bind(this)
      },
      [OrderStatus.Cancelled]: {
        title: `Order ${this.order.orderNumber}`,
        btnFunc: this.closeOrder.bind(this),
        onPageLoad: this.onCancelledOrderPageLoad.bind(this)
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
    let modal = this.modalCtrl.create(AddProducts, { products: this.products });
    modal.onDidDismiss((products: Product[]) => {
      if (products) {
        this.orderedProducts = this.orderedProducts.concat(products.map(product => {
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
    this.calculateTotal();
  }

  public calculateTotal() {
    this.totalCost = this.orderedProducts.length > 0 ? this.orderedProducts.map(product => {
      return Number(product.quantity) * Number(product.price);
    }).reduce((a, b) => a + b) : 0;
  }

  public async placeOrder() {
    this.order.orderNumber = await this.fountainService.getOrderNumber();
    this.order.storeId = this.store._id;
    this.order.supplierId = this.supplier._id;
    this.order.status = OrderStatus.Ordered;
    this.order.items = <OrderedItems[]>this.orderedProducts.map(product => {
      delete product.product;
      return product;
    });
    await this.orderService.add(this.order);
    this.navCtrl.pop();
    return;
  }

  public cancelOrder() {

  }

  public receiveOrder() {

  }

  public closeOrder() {

  }

  private async onCreateOrderPageLoad() {
    let loadEssentials: any[] = [
      this.supplierService.getAll(),
      this.storeService.getAll(),
      this.priceBookService.getDefault()
    ];

    let [suppliers, stores, pricebook] = await Promise.all(loadEssentials);
    this.pricebook = pricebook;

    let pushCallback: Function = async params => {
      if (params) {
        this.supplier = params.supplier;
        this.store = params.store;
        this.products = await this.productService.getAllBySupplier(this.supplier._id);
      }
      return;
    }
    this.navCtrl.push(AddSupplierAndStore, { suppliers, stores, callback: pushCallback });
  }

  private onOrderPageLoad() {

  }

  private onCancelledOrderPageLoad() {

  }

  private onReceivedOrderPageLoad() {

  }
}