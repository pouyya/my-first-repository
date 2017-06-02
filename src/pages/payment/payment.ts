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

  constructor(
    private salesService: SalesServices,
    public navCtrl: NavController,
    private navParams: NavParams,
    public modalCtrl: ModalController) {
    // load invoice object
    this.invoice = navParams.get('invoice');
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
      data.status && this.addPayment('cash', data.data);
    });
    modal.present();
  }

  public payWithCreditCard() {
    let modal = this.modalCtrl.create(CreditCardModal, {
      invoice: this.invoice,
      amount: Number(this.amount)
    });
    modal.onDidDismiss(data => {
      data.status && this.addPayment('credit_card', data.data);
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
    // delete current invoice for now, until pos id issue is not resolved
    this.salesService.delete(this.invoice).then(() => {
      this.navCtrl.pop();
    }, (err) => {
      console.log(new Error(err));
      this.navCtrl.pop();
    });

    // TODO: Uncomment this code once hardcoded pos id issue resolved
    /*
    this.invoice.completed = true;
    this.salesService.update(this.invoice).then(() => {
      this.navCtrl.pop();
    }, (err) => {
      throw new Error(err);
    });
    */
  }

  public goBack() {
    this.navCtrl.pop();
  }
}