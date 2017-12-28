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
  private readonly defaultLimit = 20;
  private readonly defaultOffset = 0;
  private limit: number;
  private offset: number;
  private total: number;

  constructor(
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private productService: ProductService,
    private stockHistoryService: StockHistoryService,
    private priceBookService: PriceBookService,
    private platform: Platform,
    private loading: LoadingController,
    private zone: NgZone) {
    this.limit = this.defaultLimit;
    this.offset = this.defaultOffset;
    this.total = 0;
  }

  async ionViewDidEnter() {
    try {
      let loader = this.loading.create({ content: 'Loading Products...' });
      await loader.present();
      await this.platform.ready();
      await this.fetchMore();
      let values = await this.stockHistoryService.getProductsTotalStockValueByStore(
        [ "2017-07-10T02:31:43.429Z", "2017-07-10T02:32:43.715Z" ],
        "2017-08-17T07:32:00.173Z"
      );
      console.warn(values);
      loader.dismiss();
    } catch (err) {
      throw new Error(err);
    }
  }

  showDetail(product?: ProductsList) {
    this.navCtrl.push(ProductDetails, { item: product ? <Product>_.omit(product, ['stockInHand']) : null });
  }

  async delete(product: ProductsList, index) {
    await this.productService.delete(<Product>_.omit(product, ['stockInHand']));
    this.items.splice(index, 1);
  }

  private async loadProducts(): Promise<ProductsList[]> {

    let result: { totalCount: any, docs: any[] } = await this.productService.searchProducts(this.limit, this.offset);
    this.total = result.totalCount;
    this.offset += this.limit;
    let products: any[] = result.docs;

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

  public fetchMore(infiniteScroll?: any) {
    return new Promise((resolve, reject) => {
      this.loadProducts().then(products => {
        this.zone.run(() => {
          if (this.items.length <= 0) {
            this.items = products;
          } else if (this.total > this.items.length) {
            this.items = this.items.concat(products);
          }
          this.itemsBackup = products;
          infiniteScroll && infiniteScroll.complete();
          resolve();
        });
      })
    });
  }

  public async searchProducts(event) {
    this.items = this.itemsBackup;
    var val = event.target.value;

    if (val && val.trim() != '') {
      this.items = this.items.filter((item) => {
        return ((item.name).toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }
}
