import { PriceBookService } from './../../services/priceBookService';
import _ from 'lodash';
import { LoadingController } from 'ionic-angular';
import { StockHistoryService } from './../../services/stockHistoryService';
import { Component, NgZone } from '@angular/core';
import { NavController, AlertController, Platform } from 'ionic-angular';
import { ProductService } from '../../services/productService';
import { ProductDetails } from '../product-details/product-details';
import { InventoryModule } from '../../modules/inventoryModule';
import { PageModule } from '../../metadata/pageModule';
import { Product } from '../../model/product';

interface ProductsList extends Product {
  stockInHand: number; /** Stock of all shops */
  retailPrice: number /** From default pricebook */
}

@PageModule(() => InventoryModule)
@Component({
  templateUrl: 'products.html',
  styleUrls: ['/pages/products/products.scss']
})
export class Products {
  public items: ProductsList[] = [];
  public itemsBackup: ProductsList[] = [];

  constructor(
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private productService: ProductService,
    private stockHistoryService: StockHistoryService,
    private priceBookService: PriceBookService,
    private platform: Platform,
    private loading: LoadingController,
    private zone: NgZone) {
  }

  async ionViewDidLoad() {
    try {
      let loader = this.loading.create({ content: 'Loading Products...' });
      await loader.present();
      let products: ProductsList[] = await this.loadProducts();
      await this.platform.ready();
      this.zone.run(() => {
        this.items = products;
        this.itemsBackup = products;
        console.warn(this.items)
        loader.dismiss();
      });
    } catch (err) {
      throw new Error(err);
    }
  }

  showDetail(product: ProductsList) {
    this.navCtrl.push(ProductDetails, { item: <Product>_.omit(product, ['stockInHand']) });
  }

  async delete(product: ProductsList, index) {
    await this.productService.delete(<Product>_.omit(product, ['stockInHand']));
    this.items.splice(index, 1);
  }

  public async loadProducts(): Promise<ProductsList[]> {

    let products: any[] = await this.productService.getAll();

    if (!products) {
      return [];
    }

    let priceBook = await this.priceBookService.getDefault();
    let stockValues = await this.stockHistoryService.getAllProductsTotalStockValue();

    products.forEach((product) => {

      var stockValue = <any>_.find(stockValues, { productId: product._id });
      product.stockInHand = stockValue ? stockValue.value : 0;

      let priceBookItem = _.find(priceBook.purchasableItems, { id: product._id });
      product.retailPrice = priceBookItem ? priceBookItem.retailPrice : 0;
    });

    return <ProductsList[]>products;
  }

  public loadMore() {

  }

  getItems(event) {
    this.items = this.itemsBackup;
    var val = event.target.value;

    if (val && val.trim() != '') {
      this.items = this.items.filter((item) => {
        return ((item.name).toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }
}
