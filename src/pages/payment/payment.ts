import { HelperService } from './../../services/helperService';
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
  public change: number;
  public doRefund: boolean;

  constructor(
    private salesService: SalesServices,
    public navCtrl: NavController,
    private navParams: NavParams,
    public modalCtrl: ModalController,
    public helper: HelperService) {
    // load invoice object
    this.invoice = navParams.get('invoice');
    this.doRefund = navParams.get('doRefund');
    this.amount = this.balance = 0;
    this.change = 0;
    this.calculateBalance();
  }

  ionViewDidEnter() {
    if (!this.invoice) {
      this.navCtrl.pop();
    }
  }

  private calculateBalance() {
    var totalPayments = 0;
    if(this.invoice.taxTotal > 0) {
      if (this.invoice.payments && this.invoice.payments.length > 0) {
        totalPayments = this.invoice.payments
          .map(payment => payment.amount)
          .reduce((a, b) => a + b);
      }

      this.amount = this.invoice.taxTotal - totalPayments;
      this.balance = this.amount;

      if (totalPayments >= this.invoice.taxTotal) {
        // Show Payment Completion Modal!
        this.invoice.completed = true;
        this.change = totalPayments - this.invoice.taxTotal;
        this.invoice.completedAt = new Date().toISOString();
        // sync afterwards
      }
    }
  }

  public payWithCash() {
    let modal = this.modalCtrl.create(CashModal, {
      invoice: this.invoice,
      amount: Number(this.amount)
    });
    modal.onDidDismiss(data => {
      data && data.status && this.addPayment('cash', data.data);
    });
    modal.present();
  }

  public payWithCreditCard() {
    let modal = this.modalCtrl.create(CreditCardModal, {
      invoice: this.invoice,
      amount: Number(this.amount)
    });
    modal.onDidDismiss(data => {
      data && data.status && this.addPayment('credit_card', data.data);
    });
    modal.present();
  }

  private addPayment(type: string, payment: number) {
    if (!this.invoice.payments) {
      this.invoice.payments = [];
    }
    this.invoice.payments.push({
      type: type,
      amount: Number(payment)
    });
    this.calculateBalance();
    this.salesService.update(this.invoice);
  }

  public clearInvoice() {
    this.invoice.completed = true;
    this.invoice.state = 'completed';
    this.salesService.update(this.invoice).then(() => {
      this.navCtrl.pop();
    }, (err) => {
      console.log(new Error(err));
      this.navCtrl.pop();
    });
  }

  public goBack() {
    this.navCtrl.pop();
  }
}