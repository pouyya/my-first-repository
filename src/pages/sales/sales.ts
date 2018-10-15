import _ from 'lodash';
import { EvaluationContext } from '../../services/EvaluationContext';
import { Component, ChangeDetectorRef, ViewChild, OnDestroy } from '@angular/core';
import { LoadingController, NavParams, NavController, ModalController } from 'ionic-angular';

import { SharedService } from '../../services/_sharedService';
import { SalesServices } from '../../services/salesService';
import { CategoryService } from '../../services/categoryService';
import { EmployeeService } from '../../services/employeeService';
import { CacheService } from '../../services/cacheService';
import { UserSession } from '../../modules/dataSync/model/UserSession';
import { UserService } from '../../modules/dataSync/services/userService';


import { SalesModule } from "../../modules/salesModule";
import { PageModule } from '../../metadata/pageModule';
import { BasketComponent } from '../../components/basket/basket.component';
import { SecurityModule } from '../../infra/security/securityModule';
import { Employee, WorkingStatusEnum } from '../../model/employee';
import { PurchasableItem } from '../../model/purchasableItem';
import { SyncContext } from "../../services/SyncContext";
import { Category } from '../../model/category';
import { StoreService } from "../../services/storeService";
import { POS } from "../../model/store";
import { Utilities } from "../../utility";
import { SalesHistoryPage } from "../sales-history/sales-history";
import { AttachCustomerModal } from "./modals/attach-customer/attach-customer";
import { AddonService } from "../../services/addonService";
import { AddonType } from "../../model/addon";
import { SelectTablesModal } from "../table/modal/select-table/select-tables";
import { TableStatus } from "../../model/tableArrangement";
import { Sale } from "../../model/sale";



@SecurityModule()
@PageModule(() => SalesModule)
@Component({
  selector: 'sales',
  templateUrl: 'sales.html',
  providers: [SalesServices]
})
export class Sales implements OnDestroy {

  @ViewChild(BasketComponent)
  set basketComponent(basketComponent: BasketComponent) {
    setTimeout(async () => {
      this._basketComponent = basketComponent;
      if (this._basketComponent) {
        await this._basketComponent.initializeSale(this.navParams.get('sale'), this.evaluationContext);
        this.parkedSaleCount = await this.salesService.getParkedSalesCount();
      }
    }, 100);

  }

  get basketComponent() {
    return this._basketComponent;
  }

  private _basketComponent: BasketComponent;
  private customerName: string;
  public categories: SalesCategory[];
  public activeCategory: SalesCategory;
  public register: POS;
  public parkedSaleCount: number;

  public employees: any[] = [];
  public selectedEmployee: Employee = null;
  public user: UserSession;
  private alive: boolean = true;
  private isTableEnabled: boolean = false;
  public iconTakeaway: string = "person-add";

  constructor(
    private userService: UserService,
    private _sharedService: SharedService,
    private employeeService: EmployeeService,
    private salesService: SalesServices,
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef,
    private loading: LoadingController,
    private storeService: StoreService,
    private navCtrl: NavController,
    private navParams: NavParams,
    private modalCtrl: ModalController,
    private cacheService: CacheService,
    private utils: Utilities,
    private syncContext: SyncContext,
    private addonService: AddonService
  ) {
    this.cdr.detach();
    this.parkedSaleCount = 0;
  }

  ngOnDestroy() {
    this.alive = false;
  }

  ionViewWillUnload() {
    this._sharedService.unsubscribe('updateSale');
    this._sharedService.unsubscribe('clockInOut');
    this.cacheService.removeAll();
  }

  async ionViewDidLoad() {
    this.isTableEnabled = await this.addonService.isAddonEnabled(AddonType.Table);
    this.syncContext.currentPos.categorySort = this.syncContext.currentPos.categorySort || [];
    this.syncContext.currentPos.productCategorySort = this.syncContext.currentPos.productCategorySort || {};
    this._sharedService
      .getSubscribe('clockInOut') //move it it's own module!
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

    var __this = this;

    this._sharedService
      .getSubscribe('updateSale')
      .subscribe((data) => {
        setTimeout(async () => {
          await __this._basketComponent.initializeSale(data.sale, this.evaluationContext);
        }, 100);
      });

    this.user = await this.userService.getUser();

    if (!this.syncContext.currentPos.status) {
      let openingAmount = Number(this.navParams.get('openingAmount'));
      if (openingAmount >= 0) {
        await this.storeService.openRegister(this.syncContext.currentPos, openingAmount, this.navParams.get('openingNotes'));
        await this.loadRegister();
      }
    } else {
      await this.loadRegister();
    }
    this.cdr.reattach();
  }

  private async loadRegister() { //move open/close to it's own module
    let loader = this.loading.create({ content: 'Loading Register...', });
    await loader.present();
    await this.initiateSales(this.user.settings.trackEmployeeSales);
    loader.dismiss();
  }

 
  public openSalesHistory() {
    this.navCtrl.push(SalesHistoryPage, { filterType: 'parked' });
  }

  public selectCategory(category) {
    this.activeCategory = category;
  }

  // Event
  public toggleEmployee(event) {
    this.selectedEmployee = event.selected;
  }

  // Event
  public async onSelectTile(item: PurchasableItem) {
    var currentEmployeeId = this.selectedEmployee ? this.selectedEmployee._id : null;
    var stockControl = item["stockControl"];
    this._basketComponent.addItemToBasket(item, this.activeCategory._id, currentEmployeeId, stockControl);
  }

  get evaluationContext() {
    let context = new EvaluationContext();
    context.currentStore = this.syncContext.currentStore._id;
    context.currentDateTime = new Date();
    return context;
  }

  // Event
  public paymentCompleted() {
    this.employees = this.employees.map(employee => {
      employee.selected = false;
      return employee;
    });
    this.selectedEmployee = null;
    this.customerName = "";
    this.applyIcon(true);
  }

  public onParkedSale(isParked) {
    if (!isParked && this.parkedSaleCount == 0) {
      return;
    }
    isParked ? this.parkedSaleCount += 1 : this.parkedSaleCount -= 1;
  }
  // Event
  private async loadCategoriesAndAssociations() {

    let [categories, purchasableItems] = await Promise.all([this.categoryService.getAll(), this.categoryService.getPurchasableItems()]);

    (<SalesCategory[]>categories).forEach((category, index, catArray) => {
      let items = _.filter(<PurchasableItem[]>purchasableItems, piItem => _.includes(piItem.categoryIDs, category._id));
      if (items.length === 0) {
        category.purchasableItems = [];
      } else {
        category.purchasableItems = items;
        if (this.syncContext.currentPos.productCategorySort && this.syncContext.currentPos.productCategorySort[category._id]) {
          this.utils.sort(category.purchasableItems, this.syncContext.currentPos.productCategorySort[category._id]);
        }
      }
    });
    if (this.syncContext.currentPos.categorySort && this.syncContext.currentPos.categorySort.length) {
      this.utils.sort(categories, this.syncContext.currentPos.categorySort);
    }
    this.categories = <SalesCategory[]>categories;
    this.activeCategory = _.head(this.categories) || new SalesCategory();
  }

  private async initiateSales(trackEmployeeSales: boolean) {

    await this.loadCategoriesAndAssociations();

    if (trackEmployeeSales) {
      await this.loadEmployees();
    }
  }

  private async loadEmployees() { //move to it's own module
    this.employees = await this.employeeService.getClockedInEmployeesOfStore(this.syncContext.currentStore._id);
    if (this.employees && this.employees.length > 0) {
      this.employees = this.employees.map(employee => {
        employee.selected = false;
        employee.disabled = employee.workingStatus.status == WorkingStatusEnum.BreakStart;
        return employee;
      });
    }
  }

  private findPurchasableItemByBarcode(code: string): PurchasableItem {
    for (let category of this.categories) {
      let foundItem = _.find(category.purchasableItems, item => {
        return item.hasOwnProperty('barcode') ? item.barcode == code : false;
      });
      return foundItem;
    }
  }

  public barcodeReader(code: string) { //move to separate module
    let item = this.findPurchasableItemByBarcode(code);
    item && this.onSelectTile(item); // execute in parallel
  }

  public async openRegister() {
    let loader = this.loading.create({ content: 'Opening Register...' });
    await loader.present();
    await this.storeService.openRegister(this.syncContext.currentPos,
      this.syncContext.currentPos.openingAmount, this.syncContext.currentPos.openingNote);
    await this.initiateSales(this.user.settings.trackEmployeeSales);
    loader.dismiss();
  }

  public openTablesPopup() {
    let itemsAvalaible=this._basketComponent.isItemsInBasket();
    let modal = this.modalCtrl.create(SelectTablesModal, {isItemsInBasket:itemsAvalaible});

    modal.onDidDismiss(async (res) => {
      if (res && res.table) {
        await this._basketComponent.attachTable(res.table.id);

        if (res.table.status === TableStatus.Active) {
          await this.openTableParkedSale(res.table.id);
        }
      }
    }
    );
    modal.present();
  }

  public async openTableParkedSale(tableId: string) {
    const shouldDiscard = await this.utils.confirmDiscardSale();
    if (shouldDiscard) {
      const sales = await this.salesService.searchSales([], 1, 0,
        { tableId, state: 'parked' });
      if (sales && sales.length) {
        const sale = sales[0];
        localStorage.setItem('sale_id', sale._id);
        this._sharedService.publish('updateSale', { sale });
      }
    }
  }

  public openAttachCustomerPopup() {
    if (this.customerName) {
      this._basketComponent.attachCustomer(this.customerName);
      this.applyIcon(false);
    } else {
      let modal = this.modalCtrl.create(AttachCustomerModal, { customerName: this.customerName || '' });
      modal.onDidDismiss(async (res) => {
        if (res.customerName) {
          this._basketComponent.attachCustomer(res.customerName);
        }
      });
      modal.present();
    }

  }

  public onAttachCustomer(data) {
    if (data.isAttached) {
      this.customerName = data.customerName;
    } else {
      this.customerName = "";
      this.applyIcon(true);
    }
  }

  public applyIcon(isDefault: boolean = false) {
    this.iconTakeaway = "person-add";
    if (!isDefault)
      this.iconTakeaway = "person";
  }
}

export class SalesCategory extends Category {

  constructor() {
    super();
    this.purchasableItems = [];
  }

  purchasableItems: PurchasableItem[];
}
