import { StoreService } from './../../services/storeService';
import { PriceBookService } from './../../services/priceBookService';
import { PriceBook } from './../../model/priceBook';
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
  private storeIds: string[];
  private priceBook: PriceBook;
  private readonly defaultLimit = 10;
  private readonly defaultOffset = 0;
  private limit: number;
  private offset: number;
  private total: number;

  constructor(
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private service: ProductService,
    private stockHistoryService: StockHistoryService,
    private priceBookService: PriceBookService,
    private storeService: StoreService,
    private platform: Platform,
    private loading: LoadingController,
    private zone: NgZone) {
  }

  async ionViewDidEnter() {
    try {
      let loader = this.loading.create({ content: 'Loading Products...' });
      await loader.present();
      this.priceBook = await this.priceBookService.getDefault();
      this.storeIds = (await this.storeService.getAll()).map(store => store._id);
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
    await this.service.delete(<Product>_.omit(product, ['stockInHand']));
    this.items.splice(index, 1);
  }

  public async loadProducts(): Promise<ProductsList[]> {
    try {
      let products: any[] = await this.service.getAll();
      if (products) {
        let fetchStockInHand: any[] = [];
        products.forEach((product, index, array) => {
          fetchStockInHand.push(async () => {
            let storeStock: any[] = await this.stockHistoryService
              .collectProductTotalStockValueForEachStore(product._id, this.storeIds);
            array[index].stockInHand = storeStock.length <= 0 ? 0 : storeStock
              .map(stock => stock.totalValue)
              .reduce((a, b) => a + b);
            let itemIdx: number = _.findIndex(this.priceBook.purchasableItems, { id: product.id });
            if (itemIdx > -1) {
              array[index].retailPrice = this.priceBook.purchasableItems[itemIdx].retailPrice;
              this.priceBook.purchasableItems.splice(itemIdx, 1);
            } else {
              array[index].retailPrice = 0;
            }
            // let purchasableItem = _.find(this.priceBook.purchasableItems, { id: product.id });
            // array[index].retailPrice = purchasableItem === undefined ? 0 : purchasableItem.retailPrice;
            return;
          });
        });

        await Promise.all(fetchStockInHand.map(fn => fn()));
        return <ProductsList[]>products;
      } else {
        return [];
      }
    } catch (err) {
      throw new Error(err);
    }
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
