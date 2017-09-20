import { CashMovement } from './../../../model/pos';
import { ViewController, NavParams } from 'ionic-angular';
import { Component } from '@angular/core';

@Component({
  selector: 'move-cash',
  templateUrl: 'move-cash.html'
})
export class MoveCashModal {

  public cash: CashMovement;
  public reason: string;
  public submitBtns: any = {
    add: { text: 'Add Cash', color: 'primary' },
    remove: { text: 'Remove Cash', color: 'danger' }
  };

  constructor(
    private navParams: NavParams,
    private viewCtrl: ViewController
  ) {
    this.reason = this.navParams.get('reason');
    this.cash = { amount: null, type: null, datetime: null, note: null };
  }

  public dismiss() {
    this.viewCtrl.dismiss();
  }

}