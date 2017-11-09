import { Store } from './../../../model/store';
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

  public parkIt() {

    var doPark = () => {
      localStorage.removeItem('invoice_id');
      let user = this.userService.getLoggedInUser();
      this.storeService.get(user.currentStore).then((store: Store) => {
        this.invoice.state = 'parked';
        !this.invoice.receiptNo && (this.invoice.receiptNo = this.fountainService.getReceiptNumber(store));
        this.salesService.update(this.invoice).then(() => {
          this.viewCtrl.dismiss({ status: true, error: false });
        }).catch(error => {
          console.log(new Error(error));
          this.viewCtrl.dismiss({ status: false, error: "There was an Error parking your invoice." });
        });
      }).catch(error => {
        console.log(new Error(error));
        this.viewCtrl.dismiss({ status: false, error: "There was an Error parking your invoice." });
      });
    }

    if (!this.invoice.notes || this.invoice.notes == "") {
      let confirm = this.alertController.create({
        title: 'Hey!',
        subTitle: 'Do you want to park your invoice without adding notes ?',
        buttons: [
          {
            'text': 'Yes',
            handler: () => doPark()
          },
          'No'
        ]
      });
      confirm.present();
    } else {
      doPark();
    }
  }
}