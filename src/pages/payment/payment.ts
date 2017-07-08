import { FountainService } from './../../services/fountainService';
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
  public refundCompleted: boolean = false;
  public paymentsBuffer: Array<any> = [];
  public payTypes: any = {
    'cash': { text: 'Cash', component: CashModal },
    'credit_card': { text: 'Credit Card', component: CreditCardModal }
  };

  constructor(
    private salesService: SalesServices,
    private fountainService: FountainService,
    public navCtrl: NavController,
    private navParams: NavParams,
    public modalCtrl: ModalController,
    public helper: HelperService) {

    this.invoice = navParams.get('invoice');
    this.doRefund = navParams.get('doRefund');
    this.amount = this.balance = 0;
    this.change = 0;
    this.paymentsBuffer = this.invoice.payments.map((payment) => payment);
    this.calculateBalance();
  }

  ionViewDidEnter() {
    if (!this.invoice) {
      this.navCtrl.pop();
    }
  }

  private calculateBalance() {
    var totalPayments = 0;
    if (!this.doRefund || !this.invoice.completed) {
      if (this.invoice.taxTotal > 0 && this.invoice.payments && this.invoice.payments.length > 0) {
        totalPayments = this.invoice.payments
          .map(payment => payment.amount)
          .reduce((a, b) => a + b);
      }

      this.amount = this.invoice.taxTotal - totalPayments;
      this.balance = this.amount;
      // Check for payment completion
      totalPayments >= this.invoice.taxTotal && (this.completeSale(totalPayments));
    } else {
      this.balance = this.amount = this.invoice.taxTotal;
    }
  }

  public payWith(type: string) {
    let modal = this.modalCtrl.create(this.payTypes[type].component, {
      invoice: this.invoice,
      amount: Number(this.amount),
      refund: this.doRefund
    });
    modal.onDidDismiss(data => {
      if (data && data.status) {
        this.doRefund ? this.completeRefund(data.data, type) : this.addPayment(type, data.data);
        this.salesService.update(this.invoice);
      }
    });
    modal.present();    
  }

  private addPayment(type: string, payment: number) {
    if (!this.invoice.payments) {
      this.invoice.payments = this.paymentsBuffer = [];
    }
    this.invoice.payments.push({
      type: type,
      amount: Number(payment)
    });
    this.paymentsBuffer.push({
      type: type,
      amount: Number(payment)
    });

    this.calculateBalance();
  }

  private completeRefund(payment: number, type: string) {
    this.refundCompleted = Math.abs(this.amount) === Math.abs(payment);
    if (this.refundCompleted) {
      this.paymentsBuffer.push({
        type: type,
        amount: Number(payment) * -1
      });
      this.invoice.state = 'refund';
      this.invoice.completed = true;
      this.balance = 0;
      this.invoice.payments = [];
      !this.invoice.receiptNo && (this.invoice.receiptNo = this.fountainService.getReceiptNumber());
    }
  }

  private completeSale(payments: number) {
    this.invoice.completed = true;
    this.change = payments - this.invoice.taxTotal;
    this.invoice.completedAt = new Date().toISOString();
    this.invoice.state = 'completed';
    this.invoice.payments = [];
    !this.invoice.receiptNo && (this.invoice.receiptNo = this.fountainService.getReceiptNumber());
  }

  public clearInvoice() {
    localStorage.removeItem('invoice_id');
    this.goBack();
  }

  public goBack() {
    this.navCtrl.pop();
  }
}