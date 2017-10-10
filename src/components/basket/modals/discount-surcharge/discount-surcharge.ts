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

  public action: string;
  public inputType: string;

  constructor(
    private navParams: NavParams,
    private viewCtrl: ViewController
  ) {
    this.action = DiscountSurchargeModal.DISCOUNT;
  }

  ionViewDidLoad() {
    
  }

  public confirmChanges() {
    this.viewCtrl.dismiss({});
  }

  public dismiss() {
    this.viewCtrl.dismiss();
  }

}