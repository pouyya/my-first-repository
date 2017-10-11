import { SalesServices } from './../../../../services/salesService';
import { ViewController } from 'ionic-angular';
import { NavParams } from 'ionic-angular';
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
  public action: string;
  public inputType: string;

  private totalAmount: number;
  private tax: number;

  constructor(
    private navParams: NavParams,
    private viewCtrl: ViewController,
    private salesService: SalesServices,
  ) {
    this.action = DiscountSurchargeModal.DISCOUNT;
    this.inputType = DiscountSurchargeModal.CASH;
    
    this.totalAmount = navParams.get('total') as number;
    this.tax = navParams.get('tax') as number;

  }

  public confirmChanges() {
    let fn: any;
    let typeHash = {
      [DiscountSurchargeModal.CASH]: 'asCash',
      [DiscountSurchargeModal.PRECENTAGE]: 'asPercent'
    };
    this.value = Number(this.value);
    let exec: any = typeHash[this.inputType];
    if (this.action == DiscountSurchargeModal.DISCOUNT) {
      fn = this.salesService.applyDiscountOnSale(
        this.value, this.totalAmount, this.tax
      );
    } else if (this.action == DiscountSurchargeModal.SURCHARGE) {
      fn = this.salesService.applySurchargeOnSale(
        this.value, this.totalAmount, this.tax
      );
    }
    this.viewCtrl.dismiss({
      ...fn[exec](),
      value: this.value,
      type: this.action,
      format: this.inputType
    } || null);
  }

  public dismiss() {
    this.viewCtrl.dismiss();
  }

}