import _ from 'lodash';
import { DiscountSurchargeInterface } from './../../../../model/sale';
import { ViewController, ToastController, NavParams } from 'ionic-angular';
import { Component } from '@angular/core';
import { DateTimeService } from '../../../../services/dateTimeService';

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
  public total: number;
  public action: string = DiscountSurchargeModal.DISCOUNT;
  public inputType: string = DiscountSurchargeModal.CASH;

  private values: DiscountSurchargeInterface[] = [];
  private valuesBackup: DiscountSurchargeInterface[] = [];

  constructor(
    private viewCtrl: ViewController,
    private toastCtrl: ToastController,
    private navParams: NavParams,
    private dateTimeService: DateTimeService
  ) {
    this.action = <string>this.navParams.get('action');
    this.total = <number>this.navParams.get('total');
    this.values = <DiscountSurchargeInterface[]>this.navParams.get('values');
    this.valuesBackup = _.map(this.values, value => value);
  }

  public confirmChanges() {
    if (this.value > 0) {
      if (this.action == DiscountSurchargeModal.DISCOUNT && this.inputType == DiscountSurchargeModal.CASH && this.total - this.value < 0) {
        this.toast("Final result value must be positive");
      }
      else if (this.action == DiscountSurchargeModal.DISCOUNT && this.inputType == DiscountSurchargeModal.PRECENTAGE && this.value > 100) {
        this.toast('Discount value percentage must between 0 to 100');
      } else {
        this.viewCtrl.dismiss({
          values: this.valuesBackup,
          data: <DiscountSurchargeInterface>{
            value: +this.value,
            type: this.action,
            format: this.inputType,
            createdAt: this.dateTimeService.getUTCDateString()
          }
        });
      }
    } else {
      this.toast('Value must be positive');
    }
  }

  public toast(message: string) {
    let toast = this.toastCtrl.create({
      message,
      duration: 3000
    });
    toast.present();
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