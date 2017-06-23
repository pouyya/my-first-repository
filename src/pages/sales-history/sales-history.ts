import { Platform } from 'ionic-angular';
import { Component } from '@angular/core';
import { Sale } from './../../model/sale';
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
  public statusList: Array<{ value: string, text: string }>;

  constructor(
    private platform: Platform,
    private salesService: SalesServices
  ) {
    this.invoices = [];
    this.statusList = [
      { value: 'completed', text: 'Completed' },
      { value: 'refund', text: 'Refund' },
      { value: 'parked', text: 'Parked' },
      { value: 'voided', text: 'Voided' }
    ];
  }

  ionViewDidEnter() {
    this.platform.ready().then(() => {
      // Hard coded POS ID
      var posId = "22CB398C-BC5F-29F0-8F6B-8DC5522C945F";
      this.salesService.findAllSalesByPosId(posId).then((invoices: Array<Sale>) => {
        this.invoices = invoices;
      }).catch((error) => {
        throw new Error(error);
      });
    });
  }

}