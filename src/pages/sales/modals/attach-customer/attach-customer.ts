import {ViewController, NavParams, ToastController} from 'ionic-angular';
import { Component } from '@angular/core';
import {TableArrangementService} from "../../../../services/tableArrangementService";
import {TableStatus} from "../../../../model/tableArrangement";

@Component({
  selector: 'attach-customer-modal',
  templateUrl: 'attach-customer.html'
})
export class AttachCustomerModal {

  public customerName: string;
  constructor(
    private toastCtrl: ToastController,
    private navParams: NavParams,
    private viewCtrl: ViewController
  ) {
  }

  async ionViewDidLoad() {
    this.customerName = this.navParams.get('customerName') || '';
  }

  public dismiss() {
    this.viewCtrl.dismiss({ customerName: null});
  }

  public async save(){
    let toast = this.toastCtrl.create({
        message: `Number of guests should be greater than 0`,
        duration: 3000
    });

    this.viewCtrl.dismiss({ customerName: this.customerName});
  }


  
}