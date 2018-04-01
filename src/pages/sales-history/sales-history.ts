import { EmployeeService } from './../../services/employeeService';
import { CustomerService } from './../../services/customerService';
import { NavController, AlertController, ToastController, LoadingController } from 'ionic-angular';
import { Component, NgZone } from '@angular/core';
import { Sale } from './../../model/sale';
import { Sales } from './../sales/sales';
import { SalesModule } from "../../modules/salesModule";
import { PageModule } from './../../metadata/pageModule';
import { SalesServices } from './../../services/salesService';
import { PrintService } from '../../services/printService';
import { Customer } from '../../model/customer';
import { Employee } from '../../model/employee';
import * as moment from 'moment-timezone';
import { DateTimeHelper } from '../../infra/helpers/dateTimeHelper';
import { SyncContext } from "../../services/SyncContext";

enum TimeValues {
  anytime = "1",
  today = "2",
  thisWeek = "3",
  thisMonth = "4"
}

@PageModule(() => SalesModule)
@Component({
  selector: 'sales-history',
  templateUrl: 'sales-history.html',
  providers: [SalesServices]
})
export class SalesHistoryPage {

  public sales: any[];
  public statusList: Array<{ value: any, text: string }>;
  public selectedStatus: string = '';
  public selectedPaymentType: string = '';
  public selectedTime: TimeValues = TimeValues.anytime;
  public states: any;
  public filtersEnabled: boolean = false;
  public customerSearch: string;
  public searchedCustomers: Customer[] = [];
  public employeeSearch: string;
  public searchedEmployees: Employee[] = [];
  public cancelButtonText = 'Reset';
  private limit: number;
  private readonly defaultLimit = 20;
  private readonly defaultOffset = 0;
  private offset: number;
  private total: number;
  private shownItem: any = null;
  private customersSearchHash: any = {};
  private salesBackup: any[];
  private filters: any = {};
  private timeFrame: any = null;
  private employeeId: string = null;

  constructor(
    private zone: NgZone,
    private navCtrl: NavController,
    private salesService: SalesServices,
    private customerService: CustomerService,
    private employeeService: EmployeeService,
    private alertController: AlertController,
    private toastCtrl: ToastController,
    private loading: LoadingController,
    private printService: PrintService,
    private syncContext: SyncContext
  ) {
    this.sales = [];
    this.salesBackup = [];
    this.limit = this.defaultLimit;
    this.offset = this.defaultOffset;
    this.total = 0;
    this.statusList = [
      { value: '', text: 'All' },
      { value: 'completed', text: 'Completed' },
      { value: 'refundCompleted', text: 'Refund' },
      { value: 'parked', text: 'Parked' },
      { value: 'voided', text: 'Voided' }
    ];
  }

  async ionViewDidLoad() {
    let loader = this.loading.create({
      content: 'Fetching Sales...'
    });
    await loader.present();
    try {
      await this.fetchMoreSales();
      loader.dismiss();
    } catch (err) {
      throw new Error(err);
    }
  }

  public toggleItem(sale: Sale): void {
    this.shownItem = this.isItemShown(sale._id) ? null : sale._id;
  }

  public isItemShown(id: string): boolean {
    return this.shownItem === id;
  }

  public getState(sale: Sale) {
    var state = "";
    if (sale.completed) {
      if (sale.state == 'completed') {
        state = 'Completed';
      } else if (sale.state == 'refund') {
        state = 'Refund Completed';
      }
    } else {
      if (sale.state == 'parked') {
        state = 'Parked';
      } else {
        state = 'Voided';
      }
    }
    return state;
  }

  public async printSale(sale: Sale) {
    await this.printService.printReceipt(sale);
  }

  public async gotoSales(sale: Sale, doRefund: boolean, saleIndex: number) {

    let saleId = localStorage.getItem('sale_id');
    if (saleId) {
      let confirm = this.alertController.create({
        title: 'Warning!',
        message: 'There is a sale already exists in your memory. What do you want with it ?',
        buttons: [
          {
            text: 'Discard It!',
            handler: async () => {
              let toast = this.toastCtrl.create({
                message: 'Sale has been discarded! Your selected sale is now being loaded.',
                duration: 5000
              });
              toast.present();
              var _sale = await this.loadSale(sale, doRefund);
              localStorage.setItem('sale_id', _sale._id);
              this.navCtrl.setRoot(Sales, { sale: _sale });
            }
          },
          {
            text: 'Take me to that Sale',
            handler: () => {
              this.navCtrl.setRoot(Sales);
            }
          }
        ]
      });
      confirm.present();
    } else {
      var _sale = await this.loadSale(sale, doRefund)
      localStorage.setItem('sale_id', _sale._id);
      this.navCtrl.setRoot(Sales, { sale: _sale, doRefund });
    }
  }

  public async searchBy(event: any, key: string) {
    this.sales = this.salesBackup;

    if (event.target.value) {
      this.filters[key] = event.target.value;
    } else if (this.filters.hasOwnProperty(key)) {
      delete this.filters[key];
    }

    this.limit = this.defaultLimit;
    this.offset = this.defaultOffset;
    this.sales = [];
    await this.fetchMoreSales();
  }

  public async searchForCustomer($event: any) {
    if (this.customerSearch && this.customerSearch.trim() != '' && this.customerSearch.length > 3) {
      try {
        let customers: Customer[] = await this.customerService.searchByName(this.customerSearch);
        this.searchedCustomers = customers;
        return;
      } catch (err) {
        return Promise.reject(err);
      }
    } else {
      this.searchedCustomers = [];
      return await Promise.resolve([]);
    }
  }

  public searchbar(event) {
    return {
      searchCustomers: async () => {

      },
      searchEmployees: async () => {
        if (this.employeeSearch && this.employeeSearch.trim() != '' && this.employeeSearch.length > 3) {
          try {
            let employees = await this.employeeService.searchByName(this.employeeSearch);
            employees.length > 0 && (this.searchedEmployees = employees);
            return;
          } catch (err) {
            return Promise.reject(err);
          }
        } else {
          this.searchedEmployees = [];
          return [];
        }
      }
    }
  }

  public async searchByCustomer(customer: Customer) {
    this.searchedCustomers = [];
    this.sales = this.salesBackup;
    this.filters.customerKey = customer._id;
    this.limit = this.defaultLimit;
    this.offset = this.defaultOffset;
    this.sales = [];
    this.customerSearch = `${customer.firstName} ${customer.lastName}`;
    await this.fetchMoreSales();
  }

  public async searchByEmployee(employee: Employee) {
    this.searchedEmployees = [];
    this.sales = this.salesBackup;
    this.employeeId = employee._id;
    this.limit = this.defaultLimit;
    this.offset = this.defaultOffset;
    this.sales = [];
    this.employeeSearch = `${employee.firstName} ${employee.lastName}`;
    await this.fetchMoreSales();
  }

  public async resetCustomerSearch() {
    if (this.filters.hasOwnProperty('customerKey')) {
      delete this.filters.customerKey;
      this.limit = this.defaultLimit;
      this.offset = this.defaultOffset;
      this.sales = [];
      await this.fetchMoreSales();
    }
    return;
  }

  public async resetEmployeeSearch() {
    if (this.employeeId) {
      this.employeeId = null;
      this.limit = this.defaultLimit;
      this.offset = this.defaultOffset;
      this.sales = [];
      await this.fetchMoreSales();
    }
    return;
  }

  public async searchByStatus() {
    this.sales = this.salesBackup;
    switch (this.selectedStatus) {
      case 'parked':
        this.filters.state = 'parked';
        this.filters.completed = false;
        break;
      case 'refundCompleted':
        this.filters.state = 'refund';
        this.filters.completed = true;
        break;
      case 'completed':
        this.filters.state = 'completed';
        this.filters.completed = true;
        break;
      case 'voided':
        this.filters.state = ['current', 'refund'];
        this.filters.completed = false;
        break;
      default:
        this.filters.state = false;
        this.filters.completed = null;
        break;
    }
    this.limit = this.defaultLimit;
    this.offset = this.defaultOffset;
    this.sales = [];
    await this.fetchMoreSales()
  }

  public async searchByPaymentType() {
    this.limit = this.defaultLimit;
    this.offset = this.defaultOffset;
    this.sales = [];
    await this.fetchMoreSales();
  }

  public async searchByTime() {
    this.sales = this.salesBackup;
    let startDate: Date;
    let endDate: Date;
    switch (this.selectedTime) {
      case TimeValues.today:
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        this.timeFrame = {
          startDate: moment.utc(startDate).format(),
          endDate: moment.utc(endDate).format()
        };
        break;
      case TimeValues.thisWeek:
        var thisWeek = DateTimeHelper.getWeekRange(new Date());
        this.timeFrame = {
          startDate: moment.utc(thisWeek.startDate).format(),
          endDate: moment.utc(thisWeek.endDate).format()
        };
        break;
      case TimeValues.thisMonth:
        let date = new Date();
        startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        this.timeFrame = {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        };
        break;
      default:
        this.timeFrame = null;
        break;
    }
    this.limit = this.defaultLimit;
    this.offset = this.defaultOffset;
    this.sales = [];
    await this.fetchMoreSales();
  }

  private async loadSale(sale: Sale, doRefund: boolean) {
    let newSale: Sale;
    if (doRefund && sale.completed && sale.state == 'completed') {
      newSale = this.salesService.instantiateRefundSale(sale);
      return newSale;
    } else {
      newSale = await Promise.resolve({ ...sale });
      return newSale;
    }
  }

  public async fetchMoreSales(infiniteScroll?: any) {
    try {
      let sales = await await this.salesService.searchSales(
        [this.syncContext.currentPos._id],
        this.limit,
        this.offset,
        this.filters,
        this.timeFrame,
        this.employeeId,
        this.selectedPaymentType
      );
      this.offset += sales ? sales.length : 0;
      sales = await this.attachCustomersToSales(sales);
      this.zone.run(() => {
        this.sales = this.sales.concat(sales);
        infiniteScroll && infiniteScroll.complete();
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  private async attachCustomersToSales(sales) {
    let customerPromises: any[] = [];
    sales.forEach((sale, index) => {
      customerPromises.push(new Promise((resolve, reject) => {
        if (this.customersSearchHash.hasOwnProperty(sale.customerKey)) {
          sales[index].customer = this.customersSearchHash[sale.customerKey];
          resolve();
        } else {
          this.customerService.get(sale.customerKey).then(customer => {
            sales[index].customer = customer;
            if (!this.customersSearchHash.hasOwnProperty(sale.customerKey)) {
              this.customersSearchHash[sale.customerKey] = customer;
            }
            resolve();
          }).catch(err => {
            sales[index].customer = null;
            resolve();
          });
        }
      }));
    });

    await Promise.all(customerPromises);
    return sales;
  }
}