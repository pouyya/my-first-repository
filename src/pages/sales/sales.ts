import _ from 'lodash';
import { EvaluationContext } from './../../services/EvaluationContext';
import { Component, ChangeDetectorRef, ViewChild, OnDestroy } from '@angular/core';
import { LoadingController, NavParams } from 'ionic-angular';

import { SharedService } from './../../services/_sharedService';
import { SalesServices } from '../../services/salesService';
import { CategoryService } from '../../services/categoryService';
import { PosService } from "../../services/posService";
import { EmployeeService } from './../../services/employeeService';
import { CacheService } from './../../services/cacheService';
import { UserSession } from '../../modules/dataSync/model/UserSession';
import { UserService } from '../../modules/dataSync/services/userService';

import { POS } from './../../model/pos';

import { SalesModule } from "../../modules/salesModule";
import { PageModule } from './../../metadata/pageModule';
import { BasketComponent } from './../../components/basket/basket.component';
import { SecurityModule } from '../../infra/security/securityModule';
import { Employee } from '../../model/employee';
import { PurchasableItem } from '../../model/purchasableItem';
import { SyncContext } from "../../services/SyncContext";


@SecurityModule()
@PageModule(() => SalesModule)
@Component({
  selector: 'page-variables',
  templateUrl: 'sales.html',
  styleUrls: ['/pages/sales/sales.scss'],
  providers: [SalesServices]
})
export class Sales implements OnDestroy {

  @ViewChild(BasketComponent)
  set basketComponent(basketComponent: BasketComponent) {
    setTimeout(async () => {
      this._basketComponent = basketComponent;
      if (this._basketComponent) {
        await this._basketComponent.initializeSale(this.navParams.get('sale'), this.evaluationContext);
      }
    }, 0);

  }

  get basketComponent() {
    return this._basketComponent;
  }

  private _basketComponent: BasketComponent;

  public categories: any[];
  public activeCategory: any;
  public register: POS;

  public employees: any[] = [];
  public selectedEmployee: Employee = null;
  public user: UserSession;
  private alive: boolean = true;

  constructor(
    private userService: UserService,
    private _sharedService: SharedService,
    private employeeService: EmployeeService,
    private salesService: SalesServices,
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef,
    private loading: LoadingController,
    private posService: PosService,
    private navParams: NavParams,
    private cacheService: CacheService,
    private context: SyncContext
  ) {
    this.cdr.detach();
  }

  ngOnDestroy() {
    this.alive = false;
  }

  ionViewWillUnload() {
    this.cacheService.removeAll();
  }


  async ionViewDidLoad() {

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
    this.register = this.context.currentPos;
    this.user = await this.userService.getUser();

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

  private async loadRegister() { //move open/close to it's own module
    let loader = this.loading.create({ content: 'Loading Register...', });
    await loader.present();
    await this.initiateSales(this.user.settings.trackEmployeeSales);
    loader.dismiss();
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
    context.currentStore = this.context.currentStore._id;
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
  }

  private async loadCategoriesAndAssociations() {
    let categories = await this.categoryService.getAll();
    let purchasableItems = await this.categoryService.getPurchasableItems();
    categories.forEach((category, index, catArray) => {
      let items = _.filter(purchasableItems, piItem => _.includes(piItem.categoryIDs, category._id));
      if(items.length === 0){
          category["purchasableItems"] = [];
          return;
      }
      category["purchasableItems"] = _.sortBy(items, [item => parseInt(item.order) || 0]);
    });

    this.categories = _.sortBy(_.compact(categories), [category => parseInt(category.order) || 0]);
    this.activeCategory = _.head(this.categories);
  }

  private async initiateSales(trackEmployeeSales: boolean) {

    await this.loadCategoriesAndAssociations();

    if (trackEmployeeSales) {
      await this.loadEmployees();
    }
  }

  private async loadEmployees() { //move to it's own module
    this.employees = await this.employeeService.getClockedInEmployeesOfStore(this.context.currentStore._id);
    if (this.employees && this.employees.length > 0) {
      this.employees = this.employees.map(employee => {
        employee.selected = false;
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
    this.register = await this.posService.openRegister(this.register, this.register.openingAmount, this.register.openingNote);
    await this.initiateSales(this.user.settings.trackEmployeeSales);
    loader.dismiss();
  }
}
