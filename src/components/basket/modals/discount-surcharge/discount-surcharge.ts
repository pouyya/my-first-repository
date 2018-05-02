import _ from 'lodash';
import * as moment from 'moment';
import { DiscountSurchargeInterface } from './../../../../model/sale';
import { ViewController, ToastController, NavParams } from 'ionic-angular';
import { Component } from '@angular/core';

@Component({
  selector: 'discount-surcharge-modal',
  templateUrl: 'discount-surcharge.html',
})
export class DiscountSurchargeModal {

  public static readonly DISCOUNT: string = 'discount';
  public static readonly SURCHARGE: string = 'surcharge';
  public static readonly CASH: string = 'cash';
  public static readonly PRECENTAGE: string = 'percentage';

  public value: number;
  public action: string = DiscountSurchargeModal.DISCOUNT;
  public inputType: string = DiscountSurchargeModal.CASH;

  private values: DiscountSurchargeInterface[] = [];
  private valuesBackup: DiscountSurchargeInterface[] = [];

  constructor(
    private viewCtrl: ViewController,
    private toastCtrl: ToastController,
    private navParams: NavParams
  ) {
    this.action = <string>this.navParams.get('action');
    this.values = <DiscountSurchargeInterface[]>this.navParams.get('values');
    this.valuesBackup = _.map(this.values, value => value);
  }

  public confirmChanges() {
    if (this.value > 0) {
      this.viewCtrl.dismiss({
        values: this.valuesBackup,
        data: <DiscountSurchargeInterface>{
          value: +this.value,
          type: this.action,
          format: this.inputType,
          createdAt: moment().utc().format()
        }
      });
    } else {
      let toast = this.toastCtrl.create({
        message: 'Value must be positive',
        duration: 3000
      });
      toast.present();
    }
  }

  public remove(value, index) {
    this.valuesBackup.splice(index, 1);
  }

  public dismiss() {
    this.viewCtrl.dismiss({
      values: this.valuesBackup,
      data: null
    });
  }

}