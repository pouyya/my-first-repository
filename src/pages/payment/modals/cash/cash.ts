import { Sale } from './../../../../model/sale';
import { Component } from '@angular/core';
import { NavParams, ViewController } from "ionic-angular";

@Component({
  selector: 'cash-modal',
  templateUrl: 'cash.html',
  styleUrls: []
})
export class CashModal {

  public invoice: Sale;
  public displayAmount: number;
  public quickCash: Array<number> = [10, 20, 30];

  constructor(
    private navParams: NavParams,
    public viewCtrl: ViewController) {
    this.invoice = navParams.get('invoice');
    this.displayAmount = navParams.get('amount');
  }

  public dismiss() {
    this.viewCtrl.dismiss({ status: false, data: null });
  }

  public pay(data) {
    this.viewCtrl.dismiss({ status: true, data: Number(data) });
  }
}