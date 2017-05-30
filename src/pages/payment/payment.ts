import { SalesServices } from './../../services/salesService';
import { Component } from "@angular/core";
import { NavController, NavParams, ModalController } from "ionic-angular";
import { Sale } from "../../model/sale";
import { CashModal } from './modals/cash/cash';
import { CreditCardModal } from './modals/credit-card/credit-card';

@Component({
  selector: 'payments-page',
  templateUrl: 'payment.html',
  styleUrls: ['/pages/payment/payment.scss'],
  providers: [SalesServices]
})
export class PaymentsPage {

  public invoice: Sale
  public amount: number;
  public balance: number;

  constructor(
    private salesService: SalesServices,
    public navCtrl: NavController,
    private navParams: NavParams,
    public modalCtrl: ModalController) {
    // load invoice object
    this.invoice = navParams.get('invoice');
    this.calculateBalance();
  }

  ionViewDidEnter() {
    if (!this.invoice) {
      this.navCtrl.pop();
    }
  }

  private calculateBalance() {
    this.amount = this.invoice.payments && this.invoice.payments.length > 0 ?
      this.invoice.taxTotal - this.invoice.payments
        .map(payment => payment.amount)
        .reduce((a, b) => a + b) : this.invoice.taxTotal;
    this.balance = this.amount;  
    if(this.balance === this.invoice.taxTotal) {
      // Show Payment Completion Modal!
    }
  }

  public payWithCash() {
    let modal = this.modalCtrl.create(CashModal, {
      amount: this.amount,
      total: this.invoice.taxTotal
    });
    modal.onDidDismiss(data => {
      data && this.addPayment('cash');
    });
    modal.present();
  }

  public payWithCreditCard() {
    let modal = this.modalCtrl.create(CreditCardModal, {
      amount: this.amount,
      total: this.invoice.taxTotal
    });
    modal.onDidDismiss(data => {
      data && this.addPayment('credit_card');
    });
    modal.present();
  }

  private addPayment(type: string) {
    if(!this.invoice.payments)
    {
      this.invoice.payments = [];
    }
    this.invoice.payments.push({
      type: type,
      amount: this.amount
    });
    this.calculateBalance();
    this.salesService.update(this.invoice);
  }
}