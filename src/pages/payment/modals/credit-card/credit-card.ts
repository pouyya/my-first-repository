import { Component } from '@angular/core';
import { NavParams, ViewController  } from "ionic-angular";

@Component({
  selector: 'credit-card--modal',
  templateUrl: 'credit-card.html',
  styleUrls: []
})
export class CreditCardModal {

  public displayAmount: number;
  public totalAmount: number;

  constructor(
    private navParams: NavParams,
    public viewCtrl: ViewController) {
    this.displayAmount = navParams.get('amount');
    this.totalAmount = navParams.get('total');
  }

  public dismiss() {
    this.viewCtrl.dismiss(false);
  }

  public pay() {
    this.viewCtrl.dismiss(true);
  }
}