import _ from 'lodash';
import firstBy from 'thenby';
import * as moment from 'moment-timezone';
import { PurchasableItemPriceInterface } from './../../model/purchasableItemPrice.interface';
import { EvaluationContext } from './../../services/EvaluationContext';
import { Component, ChangeDetectorRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { NavController, LoadingController, Loading, NavParams, ToastController, AlertController } from 'ionic-angular';

import { SharedService } from './../../services/_sharedService';
import { SalesServices } from '../../services/salesService';
import { CategoryService } from '../../services/categoryService';
import { PosService } from "../../services/posService";
import { UserService } from './../../services/userService';
import { EmployeeService } from './../../services/employeeService';
import { CacheService } from './../../services/cacheService';
import { UserSession } from './../../model/UserSession';
import { StoreService } from './../../services/storeService';

import { POS } from './../../model/pos';
import { Store } from './../../model/store';
import { Sale } from './../../model/sale';
import { SalesTax } from './../../model/salesTax';
import { PriceBook } from './../../model/priceBook';
import { Customer } from './../../model/customer';
import { PurchasableItem } from './../../model/purchasableItem';

import { SalesModule } from "../../modules/salesModule";
import { PageModule } from './../../metadata/pageModule';
import { BasketComponent } from './../../components/basket/basket.component';
import { PaymentsPage } from "../payment/payment";
import { CustomerService } from '../../services/customerService';
import { StockHistoryService } from '../../services/stockHistoryService';

interface InteractableItem extends PurchasableItem {
  tax: any;
  priceBook: PurchasableItemPriceInterface;
  employeeId: string;
}

interface PurchasableItemTiles {
  [id: string]: InteractableItem[]
}

@PageModule(() => SalesModule)
@Component({
  selector: 'page-variables',
  templateUrl: 'sales.html',
  styleUrls: ['/pages/sales/sales.scss'],
  providers: [SalesServices]
})
export class Sales implements OnDestroy, OnInit {

  @ViewChild(BasketComponent)
  private basketComponent: BasketComponent;

  public categories: any[];
  public purchasableItems: PurchasableItemTiles = {};
  public activeCategory: any;
  public activeTiles: any[];
  public sale: Sale;
  public register: POS;
  public store: Store;
  public doRefund: boolean = false;
  public icons: any;
  public employees: any[] = [];
  public selectedEmployee: any = null;
  public user: UserSession;
  public customer: Customer = null;
  private saleParam: any;
  private priceBook: PriceBook;
  private priceBooks: PriceBook[];
  private salesTaxes: SalesTax[];
  private categoryIdKeys: string[];
  private defaultTax: any;
  private alive: boolean = true;

  constructor(
    private userService: UserService,
    private navCtrl: NavController,
    private _sharedService: SharedService,
    private employeeService: EmployeeService,
    private salesService: SalesServices,
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef,
    private loading: LoadingController,
    private posService: PosService,
    private storeService: StoreService,
    private customerService: CustomerService,
    private stockHistoryService: StockHistoryService,
    private navParams: NavParams,
    private cacheService: CacheService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    this.saleParam = this.navParams.get('sale');
    this.doRefund = this.navParams.get('doRefund');
    this.cdr.detach();
  }

  ngOnInit() {
    this._sharedService
      .getSubscribe('clockInOut')
      .takeWhile(() => this.alive)
      .subscribe(async (data) => {
        if (data.hasOwnProperty('employee') && data.hasOwnProperty('type')) {
          let loader = this.loading.create({
            content: 'Refreshing Staff List...',
          });
          await loader.present();
          this.salesService.updateEmployeeTiles(
            this.employees, this.selectedEmployee, data.employee, data.type);
          this.employees = [...this.employees];
          loader.dismiss();
        }
      });
  }

  ngOnDestroy() {
    this.alive = false;
  }

  ionViewWillUnload() {
    this.cacheService.removeAll();
  }

  async ionViewDidLoad() {
    this.user = await this.userService.getUser();
    this.register = await this.posService.getCurrentPos();
    this.store = await this.storeService.getCurrentStore();
    let _init: boolean = false;
    if (!this.register.status) {
      let openingAmount: number = Number(this.navParams.get('openingAmount'));
      let openingNote: string = this.navParams.get('openingNotes');
      if (openingAmount >= 0) {
        this.register.openTime = moment().utc().format();
        this.register.status = true;
        this.register.openingAmount = Number(openingAmount);
        this.register.openingNote = openingNote;
        this.posService.update(this.register);
        _init = true;
      } else {
        this.cdr.reattach();
      }
    } else {
      _init = true;
    }

    if (_init) {
      let loader = this.loading.create({ content: 'Loading Register...', });
      await loader.present();
      await this.initiate(loader);
      loader.dismiss();
    }
  }

  /**
   * Select a category and fetch it's items
   * @param category
   * @returns {boolean}
   */
  public selectCategory(category) {
    this.activeCategory = category;
    this.activeTiles = this.purchasableItems[this.activeCategory._id];
    return category._id == category._id;
  }

  // Event
  public toggle(event) {
    this.selectedEmployee = event.selected;
  }

  // Event
  public async onSelect(item: InteractableItem) {
    let context = new EvaluationContext();
    context.currentStore = this.user.currentStore;
    context.currentDateTime = new Date();

    let price = this.salesService.getItemPrice(context, this.priceBooks, this.priceBook, item);
    if (price) {
      item.priceBook = price;
      item.tax = _.pick(
        item.priceBook.salesTaxId != null ?
          _.find(this.salesTaxes, { _id: item.priceBook.salesTaxId }) : this.defaultTax,
        ['rate', 'name']);
      this.selectedEmployee != null && (item.employeeId = this.selectedEmployee._id);
      this.basketComponent.addItemToBasket(await this.salesService.prepareBasketItem(item));
    } else {
      let toast = this.toastCtrl.create({
        message: `${item.name} does not have any price`,
        duration: 3000
      });
      toast.present();
      return;
    }
  }

  // Event
  public paymentClicked($event) {
    let pushCallback = params => {
      return new Promise(async (resolve, reject) => {
        if (params) {
          let response = await this.salesService.instantiateSale();
          this.saleParam = null;
          this.sale = response.sale;
          this.employees = this.employees.map(employee => {
            employee.selected = false;
            return employee;
          });
          this.selectedEmployee = null;
          this.customer = null;
          resolve();
        } else {
          resolve();
        }
        return;
      });
    }

    this.doRefund = $event.balance < 0;
    this.navCtrl.push(PaymentsPage, {
      sale: this.sale,
      doRefund: this.doRefund,
      callback: pushCallback,
      store: this.store
    });
  }

  // Event
  public notify($event) {
    if ($event.clearSale) this.saleParam = null;
  }

  private async initSalePageData(): Promise<any> {
    var data: any[] = await this.salesService.initializeSalesData(this.saleParam);
    let saleData = data.shift();
    this.salesTaxes = data[0] as Array<any>;
    this.defaultTax = data[2] as any;
    this.priceBooks = data[3] as PriceBook[];
    this.priceBook = data[1] as PriceBook;

    if (saleData.sale.customerKey) {
      // parallel
      this.customerService.get(saleData.sale.customerKey)
        .then(customer => this.customer = customer)
        .catch(err => { })
    }

    this.priceBooks.sort(
      firstBy("priority").thenBy((book1, book2) => {
        return new Date(book2._id).getTime() - new Date(book1._id).getTime();
      })
    );

    if (saleData.doRecalculate) {
      var _sale: Sale = await this.salesService.reCalculateInMemorySale(
        /* Pass By Reference */
        saleData.sale,
        this.priceBook,
        this.salesTaxes,
        this.defaultTax);

      this.sale = _sale;
      await this.salesService.update(this.sale);
    } else {
      this.sale = saleData.sale ? saleData.sale : saleData;
    };
  }

  private async loadCategoriesAndAssociations(): Promise<any> {
    try {
      let categories = await this.categoryService.getAll();
      let piItems: any[] = await this.categoryService.getPurchasableItems();
      categories.forEach((category, index, catArray) => {
        let items: InteractableItem[] = _.filter(piItems, piItem => piItem.categoryIDs == category._id).map(item => {
          return <InteractableItem>{
            ...item,
            tax: null,
            priceBook: null,
            employeeId: null
          };
        });
        if (items.length > 0) {
          this.purchasableItems[category._id] = _.sortBy(items, [item => parseInt(item.order) || 0]);
        } else {
          catArray[index] = null;
        }
      });

      this.categories = _.sortBy(_.compact(categories), [category => parseInt(category.order) || 0]);
      this.activeCategory = _.head(this.categories);
      if (this.activeCategory) {
        this.activeTiles = this.purchasableItems[this.activeCategory._id];
        this.categoryIdKeys = Object.keys(this.purchasableItems);
      }
      return;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  private async initiate(loader: Loading): Promise<any> {
    this.cdr.detach();
    let promises: any[] = [
      async () => {
        loader.setContent('Loading Items...');
        await this.loadCategoriesAndAssociations();
      },
      async () => {
        loader.setContent('Loading Sales Data...');
        await this.initSalePageData();
      }
    ];

    if (this.user.settings.trackEmployeeSales) {
      promises.push(async () => {
        loader.setContent('Loading Employees...');
        this.employees = await this.employeeService.getClockedInEmployeesOfStore(this.user.currentStore);
        if (this.employees && this.employees.length > 0) {
          this.employees = this.employees.map(employee => {
            employee.selected = false;
            return employee;
          });
        }
      });
    }
    try {
      await Promise.all(promises.map(func => func()));
      this.cdr.reattach();

      return;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  private findPurchasableItemByBarcode(code: string): InteractableItem {
    let foundItem: InteractableItem = null;
    for (let i = 0; i < this.categoryIdKeys.length; i++) {
      foundItem = _.find(this.purchasableItems[this.categoryIdKeys[i]], item => {
        return item.hasOwnProperty('barcode') ? item.barcode == code : false;
      });
      if (foundItem) {
        break;
      }
    }

    return foundItem || null;
  }

  public barcodeReader(code: string) {
    let item: InteractableItem = this.findPurchasableItemByBarcode(code);
    item && this.onSelect(item); // execute in parallel
  }

  public async onSubmit(): Promise<any> {
    let loader = this.loading.create({ content: 'Opening Register...' });
    try {
      await loader.present();

      loader.setContent('Start Opening...');

      this.register.openTime = moment().utc().format();
      this.register.status = true;
      this.register.openingAmount = Number(this.register.openingAmount);
      await this.posService.update(this.register);

      await this.initiate(loader);
      loader.dismiss();
    } catch (err) {
      throw new Error(err);
    }
  }
}
