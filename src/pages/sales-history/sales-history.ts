import { Platform, NavController, AlertController, ToastController } from 'ionic-angular';
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
  private user: any;
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
    private alertController: AlertController,
    private toastCtrl: ToastController
  ) {
    this.invoices = [];
    this.invoicesBackup = [];
    this.limit = this.defaultLimit;
    this.offset = this.defaultOffset;
    this.total = 0;
    this.statusList = [
      { value: '', text: 'All' },
      { value: 'completed', text: 'Completed' },
      { value: 'refund', text: 'Refund' },
      { value: 'parked', text: 'Parked' },
      { value: 'current', text: 'Voided' }
    ];
    this.states = {
      current: 'Voided',
      parked: 'Parked',
      refund: 'Refund Completed',
      completed: 'Completed'
    }
  }

  ionViewDidEnter() {
    this.platform.ready().then(() => {
      this.user = this.userService.getLoggedInUser();
      var promises: Array<Promise<any>> = [
        // get total count
        new Promise((resolve, reject) => {
          this.salesService.recordsCount().then((length: number) => {
            this.total = length;
            resolve();
          }).catch(error => reject(error));
        }),
        // get records
        new Promise((resolve, reject) => {
          this.salesService.searchSales(this.user.settings.currentPos, this.limit, this.offset, this.filters).then((invoices: Array<Sale>) => {
            this.offset += this.limit;
            this.invoices = invoices;
            this.invoicesBackup = this.invoices;
            resolve();
          }).catch(error => reject(error));
        })
      ];

      Promise.all(promises).catch(error => {
        throw new Error(error);
      });
    });
  }

  public toggleItem(invoice: Sale): void {
    if (['parked', 'completed'].indexOf(invoice.state) > -1) {
      this.shownItem = this.isItemShown(invoice._id) ? null : invoice._id;
    }
  }

  public isItemShown(id: string): boolean {
    return this.shownItem === id;
  }

  public gotoSales(invoice: Sale, doRefund: boolean, saleIndex: number) {
    let invoiceId = localStorage.getItem('invoice_id');
    var generateRefundAndOpen = () => {
      if(doRefund && invoice.completed && !invoice.originalSalesId) {
        let refundInvoice = this.salesService.instantiateRefundSale(invoice);
        localStorage.setItem('invoice_id', refundInvoice._id);
        this.navCtrl.setRoot(Sales, { refundInvoice, doRefund });                
      } else {
        localStorage.setItem('invoice_id', invoice._id);
        this.navCtrl.setRoot(Sales, { invoice, doRefund });
      }
    }

    if (invoiceId) {
      let confirm = this.alertController.create({
        title: 'Warning!',
        message: 'There is a sale already exists in your memory. What do you want with it ?',
        buttons: [
          {
            text: 'Discard It!',
            handler: () => {
              let toast = this.toastCtrl.create({
                message: 'Sale has been discarded! Your selected sale is now loaded.',
                duration: 5000
              });
              toast.present();
              generateRefundAndOpen();
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
      generateRefundAndOpen();
    }
  }

  public searchBy(event: any, key: string) {
    this.invoices = this.invoicesBackup;
    switch (key) {
      case 'customerName':
        this.filters.customerName = event.target.value || false;
        break;
      case 'receiptNo':
        this.filters.receiptNo = event.target.value || false;
        break;
      case 'state':
        this.filters.state = this.selectedStatus || false;
        break;
      default:
      this.filters[key] = event.target.value;
        break;
    }
    this.limit = this.defaultLimit;
    this.offset = this.defaultOffset;
    this.invoices = [];
    this.getSales().catch((error) => {
      console.error(error);
    });
  }

  getByState() {
    this.invoices = this.invoicesBackup;
    this.filters.state = this.selectedStatus || false;
    if (this.selectedStatus) {
      this.invoices = this.invoices.filter((item) => {
        return item.state == this.selectedStatus;
      });
    }
  }

  private getSales(limit?: number, offset?: number): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.total > this.invoices.length) {
        this.salesService.searchSales(
          this.user.settings.currentPos,
          limit | this.limit, offset | this.offset,
          this.filters).then((invoices: Array<Sale>) => {
            this.invoices = this.invoices.concat(invoices);
            this.invoicesBackup = this.invoices;
            resolve();
          }).catch(error => reject(error));
      } else resolve();
    });
  }

  public loadMoreSale(infiniteScroll) {
    this.getSales().then(() => {
      this.offset += this.limit;
      infiniteScroll.complete();
    }).catch((error) => console.error(error));
  }
}