import _ from 'lodash';
import firstBy from 'thenby';
import { PurchasableItemPriceInterface } from './../../model/purchasableItemPrice.interface';
import { EvaluationContext } from './../../services/EvaluationContext';
import { Component, ChangeDetectorRef, ViewChild } from '@angular/core';
import { NavController, LoadingController, NavParams, ToastController } from 'ionic-angular';

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
import { PurchasableItem } from './../../model/purchasableItem';

import { SalesModule } from "../../modules/salesModule";
import { PageModule } from './../../metadata/pageModule';
import { BasketComponent } from './../../components/basket/basket.component';
import { PaymentsPage } from "../payment/payment";
import { SecurityGuard } from '../../metadata/securityGuardModule';
import { SalesPageRoleModule } from '../../modules/roles/salesPageRoleModule';

interface InteractableItem extends PurchasableItem {
  tax: any;
  priceBook: PurchasableItemPriceInterface;
  employeeId: string;
}

@SecurityGuard(() => SalesPageRoleModule)
@PageModule(() => SalesModule)
@Component({
  selector: 'page-variables',
  templateUrl: 'sales.html',
  styleUrls: ['/pages/sales/sales.scss'],
  providers: [SalesServices],
})
export class Sales {

  @ViewChild(BasketComponent)
  private basketComponent: BasketComponent;

  public categories: any[];
  public activeCategory: any;
  public activeTiles: any[];
  public invoice: Sale;
  public register: POS;
  public store: Store;
  public doRefund: boolean = false;
  public icons: any;
  public employees: any[] = [];
  public selectedEmployee: any = null;
  public user: UserSession;
  private invoiceParam: any;
  private priceBook: PriceBook;
  private priceBooks: PriceBook[];
  private salesTaxes: SalesTax[];
  private defaultTax: any;

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
    private navParams: NavParams,
    private cacheService: CacheService,
    private toastCtrl: ToastController
  ) {
    this.invoiceParam = this.navParams.get('invoice');
    this.doRefund = this.navParams.get('doRefund');

    this._sharedService.payload$.subscribe((data) => {
      if (data.hasOwnProperty('employee') && data.hasOwnProperty('type')) {
        let loader = this.loading.create({
          content: 'Refreshing Staff List...',
        });
        loader.present().then(() => {
          this.salesService.updateEmployeeTiles(
            this.employees, this.selectedEmployee, data.employee, data.type);
          this.employees = [...this.employees];
          loader.dismiss();
        });
      }
    });
    this.cdr.detach();
  }

  ionViewWillUnload() {
    this.cacheService.removeAll();
  }

  async ionViewDidLoad() {
    this.user = this.userService.getLoggedInUser();
    try {
      this.register = await this.posService.getCurrentPos();
      this.store = await this.storeService.getCurrentStore();
      let _init: boolean = false;
      if (!this.register.status) {
        let openingAmount: number = Number(this.navParams.get('openingAmount'));
        let openingNote: string = this.navParams.get('openingNotes');
        if (openingAmount >= 0) {
          this.register.openTime = new Date().toISOString();
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
        await this.initiate();
        loader.dismiss();
      }
    }
    catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Select a category and fetch it's items
   * @param category
   * @returns {boolean}
   */
  public selectCategory(category) {
    this.activeCategory = category;
    this.salesService.loadPurchasableItems(category._id).then(
      items => this.activeTiles = _.sortBy(items, [item => parseInt(item.order) || 0]),
      error => { console.error(error); }
    );
    return category._id == category._id;
  }

  // Event
  public toggle(event) {
    this.selectedEmployee = event.selected;
  }

  // Event
  public onSelect(item: PurchasableItem) {
    let context = new EvaluationContext();
    context.currentStore = this.user.currentStore;
    context.currentDateTime = new Date();

    let price = this.salesService.getItemPrice(context, this.priceBooks, this.priceBook, item);
    if (price) {
      let interactableItem: InteractableItem = { ...item, tax: null, priceBook: price, employeeId: null };
      interactableItem.tax = _.pick(
        interactableItem.priceBook.salesTaxId != null ?
          _.find(this.salesTaxes, { _id: interactableItem.priceBook.salesTaxId }) : this.defaultTax,
        ['rate', 'name']);
      this.selectedEmployee != null && (interactableItem.employeeId = this.selectedEmployee._id);
      this.basketComponent.addItemToBasket(this.salesService.prepareBucketItem(interactableItem));
    } else {
      let toast = this.toastCtrl.create({
        message: `${item.name} does not have any price`,
        duration: 3000
      });
      toast.present();
    }
  }

  // Event
  public paymentClicked($event) {
    let pushCallback = async _params => {
      if (_params) {
        let response = await this.salesService.instantiateInvoice();
        this.invoiceParam = null;
        this.invoice = response.invoice;
        this.employees = this.employees.map(employee => {
          employee.selected = false;
          return employee;
        });
        this.selectedEmployee = null;
        return;
      }

      return await Promise.resolve();
    }

    this.doRefund = $event.balance < 0;
    this.navCtrl.push(PaymentsPage, {
      invoice: this.invoice,
      doRefund: this.doRefund,
      callback: pushCallback,
      store: this.store
    });
  }

  // Event
  public notify($event) {
    if ($event.clearSale) this.invoiceParam = null;
  }

  private initSalePageData(): Promise<any> {
    return new Promise((res, rej) => {
      this.salesService.initializeSalesData(this.invoiceParam).subscribe((data: any[]) => {
        let invoiceData = data.shift();
        this.salesTaxes = data[0] as Array<any>;
        this.defaultTax = data[2] as any;
        this.priceBooks = data[3] as PriceBook[];
        this.priceBook = data[1] as PriceBook;

        this.priceBooks.sort(
          firstBy("priority").thenBy((book1, book2) => {
            return new Date(book2._id).getTime() - new Date(book1._id).getTime();
          })
        );

        if (invoiceData.doRecalculate) {
          this.salesService.reCalculateInMemoryInvoice(
            /* Pass By Reference */
            invoiceData.invoice,
            this.priceBook,
            this.salesTaxes,
            this.defaultTax
          ).then((_invoice: Sale) => {
            this.invoice = _invoice;
            this.salesService.update(this.invoice);
            res();
          }).catch(error => rej(error));
        } else {
          this.invoice = invoiceData.invoice ? invoiceData.invoice : invoiceData;
          res();
        }
      }, error => rej(error));
    });
  }

  private async loadCategoriesAssociation(categories: any[]): Promise<any> {
    let promises: Promise<any>[] = [];
    for (let categoryIndex = categories.length - 1; categoryIndex >= 0; categoryIndex--) {
      promises.push(new Promise((resolve, reject) => {
        if (categoryIndex === 0) {
          this.activeCategory = categories[categoryIndex];
          this.salesService.loadPurchasableItems(categories[categoryIndex]._id).then((items: Array<any>) => {
            this.activeTiles = _.sortBy(items, [item => parseInt(item.order) || 0]);
            resolve();
          });
        } else {
          this.salesService.loadPurchasableItems(categories[categoryIndex]._id).then(() => resolve());
        }
      }));
    }

    return await Promise.all(promises);
  }

  public async initiate(): Promise<any> {
    this.cdr.detach();
    let promises: any[] = [
      async () => {
        this.categories = await this.categoryService.getAll();
        this.categories = _.sortBy(this.categories, [category => parseInt(category.order) || 0]);
        this.loadCategoriesAssociation(this.categories);
      },
      async () => await this.initSalePageData()
    ];

    if (this.user.settings.trackEmployeeSales) {
      promises.push(async () => {
        this.employees = await this.employeeService.getListByCurrentStatus();
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

  public async onSubmit(): Promise<any> {
    let loader = this.loading.create({ content: 'Opening Register...' });
    try {
      await loader.present();
      await this.initiate();
      this.register.openTime = new Date().toISOString();
      this.register.status = true;
      this.register.openingAmount = Number(this.register.openingAmount);
      this.posService.update(this.register);
      loader.dismiss();
    } catch (err) {
      throw new Error(err);
    }
  }
}
