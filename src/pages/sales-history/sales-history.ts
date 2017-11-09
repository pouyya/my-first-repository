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

@PageModule(() => SalesModule)
@Component({
  selector: 'sales-history',
  templateUrl: 'sales-history.html',
  styleUrls: ['/pages/sales-history/sales-history.scss'],
  providers: [SalesServices]
})
export class SalesHistoryPage {

  public invoices: Array<Sale>;
  public statusList: Array<{ value: any, text: string }>;
  public selectedStatus: string = '';
  public states: any;
  public filtersEnabled: boolean = false;
  private user: UserSession;
  private limit: number;
  private readonly defaultLimit = 5;
  private readonly defaultOffset = 0;
  private offset: number;
  private total: number;
  private shownItem: any = null;
  private invoicesBackup: Array<Sale>;
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
    private alertController: AlertController,
    private toastCtrl: ToastController,
    private loading: LoadingController
  ) {
    this.invoices = [];
    this.invoicesBackup = [];
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

  ionViewDidEnter() {
    this.platform.ready().then(() => {
      this.user = this.userService.getLoggedInUser();
      this.salesService.searchSales(this.user.currentPos, this.limit, this.offset, this.filters)
        .then((result: any) => {
          this.total = result.totalCount;
          this.offset += this.limit;
          this.invoices = result.docs;
          this.invoicesBackup = this.invoices;
        }).catch(error => {
          throw new Error(error);
        });
    });
  }

  public toggleItem(invoice: Sale): void {
    this.shownItem = this.isItemShown(invoice._id) ? null : invoice._id;
  }

  public isItemShown(id: string): boolean {
    return this.shownItem === id;
  }

  public getState(invoice: Sale) {
    var state = "";
    if (invoice.completed) {
      if (invoice.state == 'completed') {
        state = 'Completed';
      } else if (invoice.state == 'refund') {
        state = 'Refund Completed';
      }
    } else {
      if (invoice.state == 'parked') {
        state = 'Parked';
      } else {
        state = 'Voided';
      }
    }
    return state;
  }

  public async gotoSales(invoice: Sale, doRefund: boolean, saleIndex: number) {

    let invoiceId = localStorage.getItem('invoice_id');
    if (invoiceId) {
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
              var _invoice = await this.loadSale(invoice, doRefund);
              localStorage.setItem('invoice_id', _invoice._id);
              this.navCtrl.setRoot(Sales, { invoice: _invoice, doRefund });
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
      var _invoice = await this.loadSale(invoice, doRefund)
      localStorage.setItem('invoice_id', _invoice._id);
      this.navCtrl.setRoot(Sales, { invoice: _invoice, doRefund });
    }
  }

  public searchBy(event: any, key: string) {
    this.invoices = this.invoicesBackup;
    this.filters[key] = event.target.value || false;
    this.limit = this.defaultLimit;
    this.offset = this.defaultOffset;
    this.invoices = [];
    this.getSales().catch((error) => {
      console.error(error);
    });
  }

  public searchByState() {
    this.invoices = this.invoicesBackup;
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
        delete this.filters.completed;
        break;
    }
    this.limit = this.defaultLimit;
    this.offset = this.defaultOffset;
    this.invoices = [];
    this.getSales().catch((error) => {
      console.error(error);
    });
  }

  private async getSales(limit?: number, offset?: number): Promise<any> {
    if (this.total > this.invoices.length) {
      var result: any = this.salesService.searchSales(
        this.user.currentPos,
        limit | this.limit, offset | this.offset,
        this.filters);
      this.total = result.totalCount;
      this.invoices = await this.invoices.concat(result.docs);
      this.invoicesBackup = this.invoices;
    }
  }

  private async loadSale(invoice: Sale, doRefund: boolean) {
    let newInvoice: Sale;
    if (doRefund && invoice.completed && invoice.state == 'completed') {
      let store = await this.storeService.get(this.user.currentStore);
      newInvoice = this.salesService.instantiateRefundSale(invoice, store);
      return newInvoice;
    } else {
      newInvoice = await Promise.resolve({ ...invoice });
      return newInvoice;
    }
  }

  public async loadMoreSale(infiniteScroll) {
    await this.getSales()
    this.offset += this.limit;
    infiniteScroll.complete();
  }
}