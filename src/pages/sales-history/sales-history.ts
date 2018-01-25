import { CustomerService } from './../../services/customerService';
import { UserSession } from './../../model/UserSession';
import { StoreService } from './../../services/storeService';
import { Platform, NavController, AlertController, ToastController, LoadingController } from 'ionic-angular';
import { Component } from '@angular/core';
import { UserService } from './../../services/userService';
import { Sale } from './../../model/sale';
import { Sales } from './../sales/sales';
import { SalesModule } from "../../modules/salesModule";
import { PageModule } from './../../metadata/pageModule';
import { SalesServices } from './../../services/salesService';
import { PrintService } from '../../services/printService';
import { Customer } from '../../model/customer';
import { SecurityModule } from '../../infra/security/securityModule';

@SecurityModule(/** Public Access */)
@PageModule(() => SalesModule)
@Component({
  selector: 'sales-history',
  templateUrl: 'sales-history.html',
  styleUrls: ['/pages/sales-history/sales-history.scss'],
  providers: [SalesServices]
})
export class SalesHistoryPage {

  public sales: any[];
  public statusList: Array<{ value: any, text: string }>;
  public selectedStatus: string = '';
  public states: any;
  public filtersEnabled: boolean = false;
  public customerSearch: string;
  public searchedCustomers: Customer[] = [];
  public cancelButtonText = 'Reset';
  private user: UserSession;
  private limit: number;
  private readonly defaultLimit = 20;
  private readonly defaultOffset = 0;
  private offset: number;
  private total: number;
  private shownItem: any = null;
  private customersSearchHash: any = {};
  private salesBackup: any[];
  private filters: any = {
    customerName: false,
    receiptNo: false,
    state: false
  };

  constructor(
    private platform: Platform,
    private salesService: SalesServices,
    private navCtrl: NavController,
    private userService: UserService,
    private storeService: StoreService,
    private customerService: CustomerService,
    private alertController: AlertController,
    private toastCtrl: ToastController,
    private loading: LoadingController,
    private printService: PrintService
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
    try {
      let loader = this.loading.create({
        content: 'Fetching Sales...'
      });
      await loader.present();
      this.user = await this.userService.getUser();
      let result: any = await this.salesService.searchSales(
        this.user.currentPos,
        this.limit, this.offset,
        this.filters
      );
      await this.platform.ready();
      this.total = result.totalCount;
      this.offset += this.limit;
      this.sales = await this.attachCustomersToSales(result.docs);
      this.salesBackup = this.sales;
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
              this.navCtrl.setRoot(Sales, { sale: _sale, doRefund });
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
    this.filters[key] = event.target.value || false;
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

  public async searchByCustomer(customer: Customer) {
    this.searchedCustomers = [];
    this.sales = this.salesBackup;
    this.filters.customerKey = customer._id;
    this.limit = this.defaultLimit;
    this.offset = this.defaultOffset;
    this.sales = [];
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

  public searchByStatus() {
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
    this.fetchMoreSales().catch((error) => {
      console.error(error);
    });
  }

  private async getSales(limit?: number, offset?: number): Promise<any> {
    if (this.sales.length <= 0) {
      let result = await this.salesService.searchSales(
        this.user.currentPos,
        limit | this.limit, offset | this.offset,
        this.filters);
      if (result.totalCount > 0) {
        this.total = result.totalCount;
        this.sales = await this.attachCustomersToSales(result.docs);
        this.salesBackup = this.sales;
      }
    } else {
      if (this.total > this.sales.length) {
        let result: any = await this.salesService.searchSales(
          this.user.currentPos,
          limit | this.limit, offset | this.offset,
          this.filters);
        let sales = await this.attachCustomersToSales(result.docs);
        this.sales = this.sales.concat(sales);
        this.salesBackup = this.sales;
      }
    }
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
      await this.getSales()
      this.offset += this.limit;
      infiniteScroll && infiniteScroll.complete();
      return;
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