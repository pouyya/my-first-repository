import { SalesServices } from './../../../services/salesService';
import { Sale } from './../../../model/sale';
import { ViewController, NavParams } from 'ionic-angular';
import { Component } from '@angular/core';

@Component({
  selector: 'park-sale',
  templateUrl: 'park-sale.html',
  providers: [SalesServices]
})
export class ParkSale {

  public invoice: Sale;

  constructor(
    public viewCtrl: ViewController,
    private navParams: NavParams,
    private salesService: SalesServices
  ) {
    this.invoice = navParams.get('invoice');
  }

  public dismissParkSale() {
    this.viewCtrl.dismiss(false);
  }

  public parkIt() {
    if(this.invoice.notes) {
      this.invoice.state = 'parked';
      this.salesService.update(this.invoice).then(() => {
        this.viewCtrl.dismiss(true);
      }).catch((error) => {
        console.log(new Error(error));
        this.viewCtrl.dismiss(false);
      })
    }
  }
}