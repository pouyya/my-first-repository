import { GlobalConstants } from './../../metadata/globalConstants';
import { FountainService } from './../../services/fountainService';
import { HelperService } from './../../services/helperService';
import { SalesServices } from './../../services/salesService';
import { Component } from "@angular/core";
import { NavController, NavParams, ModalController } from "ionic-angular";
import { Store } from './../../model/store';
import { Sale } from "../../model/sale";
import { CashModal } from './modals/cash/cash';
import { CreditCardModal } from './modals/credit-card/credit-card';
import { PrintService } from '../../services/printService';

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
  public store: Store;
  public payTypes: any = {
    'cash': { text: 'Cash', component: CashModal },
    'credit_card': { text: 'Credit Card', component: CreditCardModal }
  };
  private navPopCallback: any;

  constructor(
    private salesService: SalesServices,
    private fountainService: FountainService,
    public navCtrl: NavController,
    private navParams: NavParams,
    public modalCtrl: ModalController,
    public helper: HelperService,
    private printService: PrintService) {

    let operation = navParams.get('operation');
    this.invoice = <Sale>navParams.get('invoice');
    this.doRefund = navParams.get('doRefund');
    this.store = <Store>navParams.get('store');
    this.navPopCallback = this.navParams.get("callback")

    this.amount = this.balance = 0;
    this.change = 0;
    if (operation == GlobalConstants.DONE_BTN) {
      this.completeSale(0);
    } else {
      this.calculateBalance();
    }
  }

  ionViewDidEnter() {
    if (!this.invoice) {
      this.navCtrl.pop();
    }
  }

  private calculateBalance() {
    var totalPayments = 0;
    if (!this.doRefund) {
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
      this.invoice.payments = [];
    }
    this.invoice.payments.push({
      type: type,
      amount: Number(payment)
    });

    this.calculateBalance();
  }

  private completeRefund(payment: number, type: string) {
    var isCompleted: boolean = Math.abs(this.amount) === Math.abs(payment);
    if (isCompleted) {
      this.invoice.payments.push({
        type: type,
        amount: Number(payment) * -1
      });

      this.invoice.state = 'refund';
      this.invoice.completed = true;
      this.invoice.completedAt = new Date().toISOString();
      this.balance = 0;
      !this.invoice.receiptNo && (this.invoice.receiptNo = this.fountainService.getReceiptNumber(this.store));
      this.printInvoice();
    }
  }

  private completeSale(payments: number) {
    this.invoice.completed = true;
    this.invoice.completedAt = new Date().toISOString();
    this.invoice.state = 'completed';
    !this.invoice.receiptNo && (this.invoice.receiptNo = this.fountainService.getReceiptNumber(this.store));
    payments != 0 && (this.change = payments - this.invoice.taxTotal);
    this.printInvoice();
  }

  public clearInvoice() {
    localStorage.removeItem('invoice_id');
    this.goBack(true);
  }

  public async printInvoice() {
    await this.printService.printReceipt(this.invoice, true);
  }

  public goBack(state: boolean = false) {
    this.navPopCallback(state).then(() => {
      this.navCtrl.pop();
    });
  }
}