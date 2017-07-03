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
    this.statusList = [
      { value: '', text: 'Default' },
      { value: 'completed', text: 'Completed' },
      { value: 'refund', text: 'Refund' },
      { value: 'parked', text: 'Parked' },
      { value: 'voided', text: 'Voided' }
    ];
    this.states = {
      current: 'Voided',
      parked: 'Parked',
      discarded: 'Discarded',
      refund: 'Refund Completed',
      completed: 'Completed'
    }
  }

  ionViewDidEnter() {
    this.platform.ready().then(() => {
      this.limit = 5;
      this.offset = 0;
      this.total = 0;
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

  public getByCustomer(event) {
    this.invoices = this.invoicesBackup;
    var val = event.target.value;
    this.filters.customerName = val || false;

    if (val && val.trim() != '') {
      this.invoices = this.invoices.filter((item) => {
        return ((item.customerName).toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }

  public getByReceiptNumber(event) {

    this.invoices = this.invoicesBackup;
    var val = event.target.value;
    this.filters.receiptNo = val || false

    if (val && val.trim() != '') {
      this.invoices = this.invoices.filter((item) => {
        return item.receiptNo == Number(val);
      })
    }
  }

  getByState() {
    this.invoices = this.invoicesBackup;
    this.filters.state = this.selectedStatus || false;
    if(this.selectedStatus) {
      this.invoices = this.invoices.filter((item) => {
        return item.state == this.selectedStatus;
      });
    }
  }

  public toggleItem(id: string, state: string): void {
    if(['parked', 'completed'].indexOf(state) > -1) {
      this.shownItem = this.isItemShown(id) ? null : id;
    }
  }

  public isItemShown(id: string): boolean {
    return this.shownItem === id;
  }

  public gotoSales(invoice, doRefund, $index) {
    let invoiceId = localStorage.getItem('invoice_id');
    if (invoiceId) {
      this.salesService.get(invoiceId).then((data: Sale) => {
        let confirm = this.alertController.create({
          title: 'Warning!',
          message: 'There is a sale already exists in your memory. What do you want with it ?',
          buttons: [
            {
              text: 'Discard It!',
              handler: () => {
                localStorage.removeItem('invoice_id');
                let toast = this.toastCtrl.create({
                  message: 'Sale has been discarded! Your selected sale is now loaded.',
                  duration: 5000
                });
                toast.present();
                this.navCtrl.push(Sales, { invoice, doRefund });
              }
            },
            {
              text: 'Take me to that Sale',
              handler: () => {
                this.navCtrl.push(Sales);
              }
            }
          ]
        });
        confirm.present();
      }).catch((error) => {
        if (error.name == 'not_found') {
          this.navCtrl.push(Sales, { invoice, doRefund });
        } else {
          throw new Error(error);
        }
      });
    } else {
      this.navCtrl.push(Sales, { invoice, doRefund });
    }
  }

  public loadMoreSale(infiniteScroll) {
    if (this.total > this.invoices.length) {
      this.salesService.searchSales(this.user.settings.currentPos, this.limit, this.offset, this.filters).then((invoices: Array<Sale>) => {
        this.offset += this.limit;
        this.invoices = this.invoices.concat(invoices);
        this.invoicesBackup = this.invoices;
        infiniteScroll.complete();
      }).catch((error) => {
        throw new Error(error);
      });
    } else {
      infiniteScroll.complete();
    }
  }
}