import _ from 'lodash';
import { DiscountSurchargeInterface } from './../../../../model/sale';
import { NavParams, ViewController } from 'ionic-angular';
import { Component } from '@angular/core';

@Component({
  selector: 'view-discount-surcharges-modal',
  templateUrl: 'view-discount-surcharge.html'
})
export class ViewDiscountSurchargesModal {

  private values: DiscountSurchargeInterface[];
  public valuesBackup: any[];

  constructor(
    private navParams: NavParams,
    private viewCtrl: ViewController
  ) {
    this.values = <DiscountSurchargeInterface[]> navParams.get('values');
    this.valuesBackup = _.map(this.values, value => value);
  }

  public delete(value, index) {
    this.valuesBackup.splice(index, 1);
  }

  public dismiss() {
    this.viewCtrl.dismiss();
  }

  public confirmChanges() {
    this.viewCtrl.dismiss(this.valuesBackup);
  }
}