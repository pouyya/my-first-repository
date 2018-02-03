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
import { PriceBook } from '../../model/priceBook';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';

interface ProductsList extends Product {
  stockInHand: number; /** Stock of all shops */
  retailPrice: number /** From default pricebook */
}

@SecurityModule(SecurityAccessRightRepo.ProductListing)
@PageModule(() => InventoryModule)
@Component({
  templateUrl: 'products.html',
  styleUrls: ['products.scss']
})
export class Products {
  public items: ProductsList[];
  private readonly defaultLimit = 10;
  private readonly defaultOffset = 0;
  private limit: number;
  private offset: number;
  private total: number;
  private priceBook: PriceBook;
  private stockValues: any;
  private filter: string;

  constructor(
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private productService: ProductService,
    private stockHistoryService: StockHistoryService,
    private priceBookService: PriceBookService,
    private platform: Platform,
    private loading: LoadingController,
    private zone: NgZone) {
    this.limit;
    this.offset;
    this.total = 0;
  }

  async ionViewDidEnter() {
    try {
      this.limit = this.defaultLimit;
      this.offset = this.defaultOffset;
      this.items = [];
      await this.platform.ready();
      let loader = this.loading.create({ content: 'Loading Products...' });
      await loader.present();

      this.priceBook = await this.priceBookService.getDefault();
      this.stockValues = await this.stockHistoryService.getAllProductsTotalStockValue();

      await this.fetchMore();
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

    var options = {};
    
    if (this.filter) {
      options['name'] = this.filter;
    }    

    let products = await this.productService.search(this.limit, this.offset, options);

    products.forEach((product) => {
      var stockValue = <any>_.find(this.stockValues, stockValue => stockValue.productId == product._id);
      product["stockInHand"] = stockValue ? stockValue.value : 0;

      let priceBookItem = _.find(this.priceBook.purchasableItems, { id: product._id });
      product["retailPrice"] = priceBookItem ? priceBookItem.retailPrice : 0;
    });

    return <ProductsList[]>products;
  }

  public async fetchMore(infiniteScroll?: any) {
  
    var products = await this.loadProducts();

    this.offset += products ? products.length : 0;

    this.zone.run(() => {
      this.items = this.items.concat(products);
      infiniteScroll && infiniteScroll.complete();
    });
  }

  public async searchProducts(event) {
    let val = event.target.value;

    if (val && val.trim() != '') {
      this.filter = val;
    }
    else {
      this.filter = '';
    }

    this.limit = this.defaultLimit;
    this.offset = this.defaultOffset;
    this.items = [];

    this.priceBook = await this.priceBookService.getDefault();
    this.stockValues = await this.stockHistoryService.getAllProductsTotalStockValue();

    await this.fetchMore();
  }
}
