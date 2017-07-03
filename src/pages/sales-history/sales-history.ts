import { Platform, NavController } from 'ionic-angular';
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
  public statusList: Array<{ value: string, text: string }>;
  public selectedStatus: string = "completed";
  public states: any;
  public filtersEnabled: boolean = false;
  private user: any;
  private limit: number = 5;
  private offset: number = 0;
  private total: number = 0;
  private shownItem: any = null;
  private invoicesBackup: Array<Sale>;
  private filters: any = {
    customerName: "",
    receiptNumber: 1,
    state: ""
  };

  constructor(
    private platform: Platform,
    private salesService: SalesServices,
    private navCtrl: NavController,
    private userService: UserService
  ) {
    this.invoices = [];
    this.invoicesBackup = [];
    this.statusList = [
      { value: 'completed', text: 'Completed' },
      { value: 'refund', text: 'Refund' },
      { value: 'parked', text: 'Parked' },
      { value: 'voided', text: 'Voided' }
    ];
    this.states = {
      current: 'Voided',
      parked: 'Parked',
      discarded: 'Discarded',
      refund: 'Refund Completed'
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
          this.salesService.findAllSalesByPosId(this.user.settings.currentPos, this.limit, this.offset).then((invoices: Array<Sale>) => {
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

    if (val && val.trim() != '') {
      this.invoices = this.invoices.filter((item) => {
        return ((item.customerName).toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }

  public getByReceiptNumber(event) {
    
    this.invoices = this.invoicesBackup;
    var val = event.target.value;

    if (val && val.trim() != '') {
      this.invoices = this.invoices.filter((item) => {
        return item.receiptNo == Number(val);
      })
    }
  }

  getByState() {
    this.invoices = this.invoicesBackup;
    this.invoices = this.invoices.filter((item) => {
      return item.state = this.selectedStatus;
    });
  }

  public toggleItem(id: string): void {
    this.shownItem = this.isItemShown(id) ? null : id;
  }

  public isItemShown(id: string): boolean {
    return this.shownItem === id;
  }

  public gotoSales(invoice, doRefund, $index) {
    this.navCtrl.push(Sales, { invoice, doRefund });
  }

  public loadMoreSale(infiniteScroll) {
    if(this.total > this.invoices.length) {
      this.salesService.findAllSalesByPosId(this.user.settings.currentPos, this.limit, this.offset).then((invoices: Array<Sale>) => {
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