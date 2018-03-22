import { PriceBookService } from './../../services/priceBookService';
import _ from 'lodash';
import { LoadingController } from 'ionic-angular';
import { StockHistoryService } from './../../services/stockHistoryService';
import { Component, NgZone } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { ProductService } from '../../services/productService';
import { ProductDetails } from '../product-details/product-details';
import { InventoryModule } from '../../modules/inventoryModule';
import { PageModule } from '../../metadata/pageModule';
import { Product } from '../../model/product';
import { PriceBook } from '../../model/priceBook';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';
import { SortOptions } from '@simpleidea/simplepos-core/dist/services/baseEntityService';
import {SearchableListing} from "../../modules/searchableListing";
import {Item} from "../../metadata/listingModule";

interface ProductsList extends Product {
  stockInHand: number; /** Stock of all shops */
  retailPrice: number /** From default pricebook */
}

@SecurityModule(SecurityAccessRightRepo.ProductListing)
@PageModule(() => InventoryModule)
@Component({
  templateUrl: 'products.html'
})
export class Products extends SearchableListing<Product>{
  public items: ProductsList[] = [];
  private priceBook: PriceBook;
  private stockValues: any;

  constructor(
    private navCtrl: NavController,
    private productService: ProductService,
    private stockHistoryService: StockHistoryService,
    private priceBookService: PriceBookService,
    private platform: Platform,
    private loading: LoadingController,
    protected zone: NgZone) {
    super(productService, zone, 'Product');
  }

  async ionViewDidEnter() {
    await this.platform.ready();
    this.setDefaultSettings();
    let loader = this.loading.create({ content: 'Loading Products...' });
    await loader.present();
    try {
      this.priceBook = await this.priceBookService.getDefault();
      this.stockValues = await this.stockHistoryService.getAllProductsTotalStockValue();
      this.options = {
          sort: [
              { order: SortOptions.ASC }
          ],
          conditionalSelectors: {
              order: {
                  $gt: true
              }
          }
      }
      await this.fetchMore();
      loader.dismiss();
    } catch (err) {
      throw new Error(err);
    }
  }

  showDetail(product?: ProductsList) {
    this.navCtrl.push(ProductDetails, { item: product ? <Product>_.omit(product, ['stockInHand']) : null });
  }

  public async remove(product: ProductsList, index) {
    await super.remove(<Product>_.omit(product, ['stockInHand']), index);
  }

  public async fetchMore(infiniteScroll?: any) {
    let products: ProductsList[] = <ProductsList[]>await this.loadData();
    products.forEach((product) => {
        var stockValue = <any>_.find(this.stockValues, stockValue => stockValue.productId == product._id);
        product["stockInHand"] = stockValue ? stockValue.value : 0;

        let priceBookItem = _.find(this.priceBook.purchasableItems, { id: product._id });
        product["retailPrice"] = priceBookItem ? priceBookItem.retailPrice : 0;
    });

    this.offset += products ? products.length : 0;

    this.zone.run(() => {
      this.items = this.items.concat(products);
      infiniteScroll && infiniteScroll.complete();
    });
  }

  public async searchByText(filterItem: Item, value) {
    this.priceBook = await this.priceBookService.getDefault();
    this.stockValues = await this.stockHistoryService.getAllProductsTotalStockValue();
    await super.searchByText(filterItem, value);
  }
}
