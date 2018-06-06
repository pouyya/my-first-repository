import { PriceBookService } from './../../services/priceBookService';
import _ from 'lodash';
import {AlertController, LoadingController} from 'ionic-angular';
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
import { SearchableListing } from "../../modules/searchableListing";
import { Item } from "../../metadata/listingModule";
import { AccountSettingService } from "../../modules/dataSync/services/accountSettingService";
import {Subject} from "rxjs/Subject";
import {CategoryService} from "../../services/categoryService";
import {UserService} from "../../modules/dataSync/services/userService";
import {Category} from "../../model/category";
import {AppService} from "../../services/appService";
import {Utilities} from "../../utility";

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
  public isTaxInclusive: boolean = false;
  private categoryNamesMapping = {};
  private importedProducts: Subject<Object[]> = new Subject<Object[]>();

  constructor(
    private navCtrl: NavController,
    private productService: ProductService,
    private stockHistoryService: StockHistoryService,
    private priceBookService: PriceBookService,
    private platform: Platform,
    private loading: LoadingController,
    private appService: AppService,
    private accountSettingService: AccountSettingService,
    private userService: UserService,
    private alertCtrl: AlertController,
    protected zone: NgZone,
    private categoryService: CategoryService,
    private utility: Utilities) {
    super(productService, zone, 'Product');
  }

  async ionViewDidEnter() {
    await this.platform.ready();
    let loader = this.loading.create({ content: 'Loading Products...' });
    await loader.present();
    try {
      const categories = await this.categoryService.getAll();
      this.categoryNamesMapping = categories.reduce((initialObj, category) => {
        initialObj[category.name] = category._id;
        return initialObj;
      }, {});

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
      var currentAccount = await this.accountSettingService.getCurrentSetting();
      this.isTaxInclusive = currentAccount.taxType;
      this.onImportListener();
      await this.fetch();
      loader.dismiss();
    } catch (err) {
      throw new Error(err);
    }
  }

  showDetail(product?: ProductsList) {
    this.navCtrl.push(ProductDetails, { item: product ? <Product>_.omit(product, ['stockInHand']) : null });
  }

  public async remove(product: ProductsList, index) {
    const deleteItem = await this.utility.confirmRemoveItem("Do you really want to delete this product!");
    if(!deleteItem){
      return;
    }
    let deleteAssocs: any[] = [
        async () => {
              // delete pricebook entries
            let pbIndex = _.findIndex(this.priceBook.purchasableItems, { id: product._id });
            if (pbIndex > -1) {
                  this.priceBook.purchasableItems.splice(pbIndex, 1);
                  return await this.priceBookService.update(this.priceBook);
            }
          }
    ];

    await Promise.all(deleteAssocs);
    await super.remove(<Product>_.omit(product, ['stockInHand']), index);
  }

  public async fetchMore(infiniteScroll?: any) {
    let products: ProductsList[] = <ProductsList[]>await this.loadData();
    products.forEach((product) => {
      var stockValue = <any>_.find(this.stockValues, stockValue => stockValue.productId == product._id);
      product["stockInHand"] = stockValue ? stockValue.value : 0;

      let priceBookItem = _.find(this.priceBook.purchasableItems, { id: product._id });
      product["retailPrice"] = priceBookItem ? priceBookItem.retailPrice : 0;
      product["inclusivePrice"] = priceBookItem ? priceBookItem.inclusivePrice : 0;
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

  private onImportListener(){
    this.importedProducts.asObservable().subscribe( async importedProducts => {
      if(!importedProducts.length){
        return;
      }
      let loader = this.loading.create({ content: 'Starting Import Products...' });
      await loader.present();
      const products = await this.productService.getAll();
      const productNamesMap = products.reduce((initialObj, product) => {
          initialObj[product.name] = true;
          return initialObj;
      }, {});
      const errorProducts = [];
      const productsToAdd = [];
      importedProducts.forEach((product: any) => {
        if(productNamesMap[product.ProductName]){
            errorProducts.push(product.ProductName);
        }else if(product.ProductName) {
            productsToAdd.push(product);
        }
      });

      if(productsToAdd.length){
        const user = await this.userService.getUser();
        const salesTax = await this.appService.loadSalesAndGroupTaxes();
        let categoriesToAdd = new Set();
        productsToAdd.forEach(product => {
            if(product.CategoryNames){
                const categories = product.CategoryNames.split('|');
                categories.forEach(category => {
                    this.categoryNamesMapping[category] == undefined && categoriesToAdd.add(category);
                });
            }
        });

        if(categoriesToAdd.size){
            loader.setContent('Importing categories');
            await this.addCategories(Array.from(categoriesToAdd), user);
        }

        const promises = productsToAdd.map( product => {
            const newProduct = new Product();
            newProduct.barcode = product.Barcode;
            newProduct.categoryIDs = product.CategoryNames ?
                product.CategoryNames.split('|').map(category => this.categoryNamesMapping[category]) : [];
            newProduct.name = product.ProductName;
            newProduct.icon = user.settings.defaultIcon;
            newProduct.isModifier = product.IsModifier === 1;
            return this.productService.add(newProduct);
        });
        loader.setContent('Importing Products');
        const newProducts = await Promise.all(promises);
        loader.setContent('Updating Prices');
        newProducts.forEach(newProduct => {
            const product: any =  _.find(productsToAdd, {ProductName : newProduct.name});
            if(!product){
                return;
            }
            const saleTax = _.find(salesTax, { name : product.SellTaxCode }) || _.find(salesTax, { name : 'GST' });
            this.priceBook.purchasableItems.push({
                id: newProduct._id,
                retailPrice: this.priceBookService.calculateRetailPriceTaxExclusive(
                    Number(product.SellPriceIncTax), Number(saleTax.rate)),
                inclusivePrice: Number(product.SellPriceIncTax),
                supplyPrice: 0,
                markup: 0,
                salesTaxId: saleTax._id,
                saleTaxEntity: 'SalesTax'
            });
        });
        await this.priceBookService.update(this.priceBook);
      }

      await loader.dismiss();

      if(errorProducts.length){
         let confirm = this.alertCtrl.create({
              title: 'Errors',
              subTitle: `Following products already present \n ${errorProducts.join(', ')}`,
              buttons: [
                  'OK'
              ]
          });
          confirm.present();
      }
    });
  }

  private async addCategories(categories, user){
    const promises = categories.map(categoryName => {
      const category = new Category();
      category.name = categoryName;
      category.icon = user.settings.defaultIcon;
      return this.categoryService.add(category);
    });

    const categoryItems = await Promise.all(promises);
    categoryItems.forEach(( categoryItem: Category ) => {
      this.categoryNamesMapping[categoryItem.name] = categoryItem._id;
    });
  }
}
