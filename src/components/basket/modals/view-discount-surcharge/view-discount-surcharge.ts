import { DiscountSurchargeInterface } from './../../../../model/sale';
import { NavParams, ViewController } from 'ionic-angular';
import { Component } from '@angular/core';

@Component({
  selector: 'view-discount-surcharges-modal',
  templateUrl: 'view-discount-surcharge.html'
})
export class ViewDiscountSurchargesModal {

  public values: DiscountSurchargeInterface[];

  constructor(
    private navParams: NavParams,
    private viewCtrl: ViewController
  ) {
    this.values = <DiscountSurchargeInterface[]> navParams.get('values');
  }

  public delete() {
    // will delete discount/surcharge
  }

  public dismiss() {
    this.viewCtrl.dismiss();
  }
}