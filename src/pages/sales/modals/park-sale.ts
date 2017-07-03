import { SalesServices } from './../../../services/salesService';
import { Sale } from './../../../model/sale';
import { ViewController, NavParams, AlertController } from 'ionic-angular';
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
    private salesService: SalesServices,
    public alertController: AlertController
  ) {
    this.invoice = navParams.get('invoice');
  }

  public dismissParkSale() {
    this.viewCtrl.dismiss({ status: false, error: false });
  }

  public parkIt() {
    if (!this.invoice.notes || this.invoice.notes == "") {
      let confirm = this.alertController.create({
        title: 'Hey!',
        subTitle: 'Do you want to park your invoice without adding notes ?',
        buttons: [
          {
            'text': 'Yes',
            handler: () => {
              this.invoice.state = 'parked';
              this.salesService.update(this.invoice).then(() => {
                this.viewCtrl.dismiss({ status: true, error: false });
              }).catch((error) => {
                console.log(new Error(error));
                this.viewCtrl.dismiss({ status: false, error: "There was an Error parking your invoice." });
              });
            }
          },
          'No'
        ]
      });
      confirm.present();
    } else {
      this.invoice.state = 'parked';
      this.salesService.update(this.invoice).then(() => {
        this.viewCtrl.dismiss({ status: true, error: false });
      }).catch((error) => {
        console.log(new Error(error));
        this.viewCtrl.dismiss({ status: false, error: "There was an Error parking your invoice." });
      });
    }
  }
}