import _ from 'lodash';
import firstBy from 'thenby';
import { PurchasableItemPriceInterface } from './../../model/purchasableItemPrice.interface';
import { EvaluationContext } from './../../services/EvaluationContext';
import { Component, ChangeDetectorRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { NavController, LoadingController, NavParams, ToastController, AlertController } from 'ionic-angular';

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
import { PriceBookService } from '../../services/priceBookService';

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
    private priceBookService: PriceBookService,
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
    [this.user, this.register, this.store] = [
      await this.userService.getUser(),
      await this.posService.getCurrentPos(),
      await this.storeService.getCurrentStore()];

    if (!this.register.status) {
      let openingAmount = Number(this.navParams.get('openingAmount'));
      if (openingAmount >= 0) {
        this.register = await this.posService.openRegister(this.register, openingAmount, this.navParams.get('openingNotes'));
        await this.loadRegister();
      }
    } else {
      await this.loadRegister();
    }

    this.cdr.reattach();
  }

  private async loadRegister() {
    let loader = this.loading.create({ content: 'Loading Register...', });
    await loader.present();
    await this.initiateSales();
    loader.dismiss();
  }

  public selectCategory(category) {
    this.activeCategory = category;
    this.activeTiles = this.purchasableItems[this.activeCategory._id];
    return category._id == category._id;
  }

  // Event
  public toggleEmployee(event) {
    this.selectedEmployee = event.selected;
  }

  // Event
  public async onSelectTile(item: InteractableItem) {
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
      this.basketComponent.addItemToBasket(await this.salesService.prepareBasketItem(item, this.activeCategory._id));
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

    let pushCallback = async params => {
      if (params) {
        this.saleParam = null;
        this.sale = await this.salesService.instantiateSale();
        this.employees = this.employees.map(employee => {
          employee.selected = false;
          return employee;
        });
        this.selectedEmployee = null;
        this.customer = null;
      } else {
        this.basketComponent.calculateAndSync();
      }
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

  private async initSalePageData() {

    [this.salesTaxes, this.priceBook, this.defaultTax, this.priceBooks] =
      [await this.salesService.getSaleTaxs(),
      await this.priceBookService.getPriceBookByCriteria(),
      await this.salesService.getDefaultTax(),
      await this.priceBookService.getExceptDefault()];

    let saleData = this.saleParam ? this.saleParam : await this.salesService.instantiateSale();

    if (saleData.customerKey) {
      this.customer = await this.customerService.get(saleData.customerKey);
    }

    this.priceBooks.sort(
      firstBy("priority").thenBy((book1, book2) => {
        return new Date(book2._id).getTime() - new Date(book1._id).getTime();
      })
    );

    if (saleData.state == 'current') {
      var _sale: Sale = await this.salesService.reCalculateInMemorySale(
        /* Pass By Reference */
        saleData,
        this.priceBook,
        this.salesTaxes,
        this.defaultTax);

      this.sale = _sale;
      await this.salesService.update(this.sale);
    } else {
      this.sale = saleData;
    };
  }

  private async loadCategoriesAndAssociations() {
    let categories = await this.categoryService.getAll();
    let purchasableItems: any[] = await this.categoryService.getPurchasableItems();
    categories.forEach((category, index, catArray) => {
      let items: InteractableItem[] = _.filter(purchasableItems, piItem => piItem.categoryIDs == category._id).map(item => {
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
  }

  private async initiateSales() {

    await this.loadCategoriesAndAssociations();

    await this.initSalePageData();

    if (this.user.settings.trackEmployeeSales) {
      await this.loadEmployees();
    }
  }

  private async loadEmployees() {
    this.employees = await this.employeeService.getClockedInEmployeesOfStore(this.user.currentStore);
    if (this.employees && this.employees.length > 0) {
      this.employees = this.employees.map(employee => {
        employee.selected = false;
        return employee;
      });
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
    item && this.onSelectTile(item); // execute in parallel
  }

  public async openRegister(): Promise<any> {
    let loader = this.loading.create({ content: 'Opening Register...' });
    await loader.present();
    this.register = await this.posService.openRegister(this.register, this.register.openingAmount, this.register.openingNote);
    await this.initiateSales();
    loader.dismiss();
  }
}
