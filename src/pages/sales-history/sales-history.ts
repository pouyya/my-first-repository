import { UserService } from './../../services/userService';
import { Platform, NavController } from 'ionic-angular';
import { Component } from '@angular/core';
import { Sale } from './../../model/sale';
import { Sales } from './../sales/sales';
import { SalesModule } from "../../modules/salesModule";
import { PageModule } from './../../metadata/pageModule';
import { SalesServices } from './../../services/salesService';

@PageModule(() => SalesModule)
@Component({
  selector: 'sales-history',
  templateUrl: 'sales-history.html',
  styleUrls: [ '/pages/sales-history/sales-history.scss' ],
  providers: [ SalesServices ]
})
export class SalesHistoryPage {

  public invoices: Array<Sale>;
  public invoicesBackup: Array<Sale>;
  public statusList: Array<{ value: string, text: string }>;
  public selectedStatus: any;
  public states: any;
  private shownItem: any = null;

  constructor(
    private platform: Platform,
    private salesService: SalesServices,
    private navCtrl: NavController,
    private userService: UserService
  ) {
    this.invoices = [];
    this.invoicesBackup = [];
    this.selectedStatus = { value: 'completed', text: 'Completed' };
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
      // Hard coded POS ID
      var user = this.userService.getLoggedInUser();
      // TODO: Infinite scroll will be applied later
      this.salesService.findAllSalesByPosId(user.settings.currentPos).then((invoices: Array<Sale>) => {
        this.invoices = invoices;
        this.invoicesBackup = this.invoices;
      }).catch((error) => {
        throw new Error(error);
      });
    });
  }

  public getByCustomer(event) {
    this.invoices = this.invoicesBackup;
    var val = event.target.value;
    
    if(val && val.trim() != ''){
       this.invoices = this.invoices.filter((item)=>{
          return((item.customerName).toLowerCase().indexOf(val.toLowerCase()) > -1);
       })
    }
  }

  public getByReceiptNumber(event) {
    this.invoices = this.invoicesBackup;
    var val = event.target.value;
    
    if(val && val.trim() != ''){
       this.invoices = this.invoices.filter((item)=>{
         return item.receiptNo == Number(val);
       })
    }
  }

  public toggleItem(id: string): void {
    this.shownItem = this.isItemShown(id) ? null : id;
  }

  public isItemShown(id: string): boolean {
    return this.shownItem === id;
  }

  public gotoSales(invoice, forRefund, $index) {
    this.navCtrl.push(Sales, { invoice, forRefund });
  }
}