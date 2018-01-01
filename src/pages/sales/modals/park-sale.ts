import { StoreService } from './../../../services/storeService';
import { UserService } from './../../../services/userService';
import { FountainService } from './../../../services/fountainService';
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
    private viewCtrl: ViewController,
    private alertController: AlertController,
    private navParams: NavParams,
    private salesService: SalesServices,
    private fountainService: FountainService,
    private userService: UserService,
    private storeService: StoreService
  ) {
    this.invoice = navParams.get('invoice');
  }

  public dismissParkSale() {
    this.viewCtrl.dismiss({ status: false, error: false });
  }

  public async parkIt() {
    var doPark = async () => {
      localStorage.removeItem('invoice_id');

      this.invoice.state = 'parked';
      await this.salesService.update(this.invoice);
      this.viewCtrl.dismiss({ status: true, error: false });
    }

    if (!this.invoice.notes || this.invoice.notes == "") {
      let confirm = this.alertController.create({
        title: 'Hey!',
        subTitle: 'Do you want to park your invoice without adding notes ?',
        buttons: [
          {
            'text': 'Yes',
            handler: () => { doPark(); }
          },
          'No'
        ]
      });
      confirm.present();
    } else {
      await doPark();
    }
  }
}