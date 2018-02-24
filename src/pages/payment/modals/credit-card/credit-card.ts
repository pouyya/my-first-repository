import { Sale } from './../../../../model/sale';
import { Component } from '@angular/core';
import { NavParams, ViewController  } from "ionic-angular";

@Component({
  selector: 'credit-card--modal',
  templateUrl: 'credit-card.html',
  styleUrls: []
})
export class CreditCardModal {

  public sale: Sale;
  public displayAmount: number;
  public isRefund: boolean;

  constructor(
    private navParams: NavParams,
    public viewCtrl: ViewController) {
    this.displayAmount = this.navParams.get('amount');
    this.sale = this.navParams.get('sale');
    this.isRefund = this.navParams.get('refund');
  }

  public dismiss() {
    this.viewCtrl.dismiss({ status: false, data: null });
  }

  public pay(data) {
    this.viewCtrl.dismiss({ status: true, data: Number(data) });
  }
}