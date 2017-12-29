import * as moment from 'moment';
import { GlobalConstants } from './../../metadata/globalConstants';
import { FountainService } from './../../services/fountainService';
import { HelperService } from './../../services/helperService';
import { SalesServices } from './../../services/salesService';
import { Component } from "@angular/core";
import { NavController, NavParams, ModalController, LoadingController, AlertController } from "ionic-angular";
import { Store } from './../../model/store';
import { Sale } from "../../model/sale";
import { CashModal } from './modals/cash/cash';
import { CreditCardModal } from './modals/credit-card/credit-card';
import { PrintService } from '../../services/printService';
import { StockHistoryService } from '../../services/stockHistoryService';
import { StockHistory } from '../../model/stockHistory';

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
  public stockErrors: any[] = [];
  public payTypes: any = {
    'cash': { text: 'Cash', component: CashModal },
    'credit_card': { text: 'Credit Card', component: CreditCardModal }
  };
  private navPopCallback: any;

  constructor(
    private salesService: SalesServices,
    private fountainService: FountainService,
    private stockHistoryService: StockHistoryService,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private navParams: NavParams,
    private modalCtrl: ModalController,
    private helper: HelperService,
    private loading: LoadingController,
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

  async ionViewDidEnter() {
    if (!this.invoice) {
      this.navCtrl.pop();
    } else {
      // check stock
      let loader = this.loading.create({ content: 'Processing Sale' });
      await loader.present();
      await this.checkForStockInHand();
      if (this.stockErrors.length > 0) {
        // display error message
        let alert = this.alertCtrl.create(
          {
            title: 'Out of Stock',
            subTitle: 'Please make changes to invoice and continue',
            message: `${this.stockErrors.join('\n')}`,
            buttons: ['Ok']
          }
        );
        alert.present();
      }
      loader.dismiss();
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

  public payWith() {
    let openModal = (component: Component, type: string) => {
      let modal = this.modalCtrl.create(component, {
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
    return {
      cash: () => openModal(this.payTypes.cash.component, 'cash'),
      creditCard: () => openModal(this.payTypes.credit_card.component, 'credit_card')
    }
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

  private async completeRefund(payment: number, type: string) {
    var isCompleted: boolean = Math.abs(this.amount) === Math.abs(payment);
    if (isCompleted) {
      let loader = this.loading.create({ content: 'Processing Refund' });
      await loader.present();
      await this.updateStock();
      this.invoice.payments.push({
        type: type,
        amount: Number(payment) * -1
      });

      this.invoice.state = 'refund';
      this.invoice.completed = true;
      this.invoice.completedAt = moment().utc().format();
      this.balance = 0;
      !this.invoice.receiptNo && (this.invoice.receiptNo = this.fountainService.getReceiptNumber(this.store));
      loader.dismiss();
      this.printInvoice();
    }
  }

  private async completeSale(payments: number) {
    let loader = this.loading.create({ content: 'Finalizing Sale' });
    await loader.present();
    await this.updateStock();
    this.invoice.completed = true;
    this.invoice.completedAt = moment().utc().format();
    this.invoice.state = 'completed';
    !this.invoice.receiptNo && (this.invoice.receiptNo = this.fountainService.getReceiptNumber(this.store));
    payments != 0 && (this.change = payments - this.invoice.taxTotal);
    loader.dismiss();
    this.printInvoice();
  }

  public clearInvoice() {
    localStorage.removeItem('invoice_id');
    this.goBack(true);
  }

  public async printInvoice() {
    if (this.store.printReceiptAtEndOfSale) {
      await this.printService.printReceipt(this.invoice, true);
    }
  }

  public goBack(state: boolean = false) {
    this.navPopCallback(state).then(() => {
      this.navCtrl.pop();
    });
  }

  private async checkForStockInHand() {
    this.stockErrors = [];
    let productsInStock: { [id: string]: number } = {};
    let allProducts = this.invoice.items
        .filter(item => item.entityTypeName == 'Product')
        .map(item => item._id);
    if(allProducts.length > 0) {
      productsInStock = await this.stockHistoryService
        .getProductsTotalStockValueByStore(allProducts, this.store._id);
      if (productsInStock && Object.keys(productsInStock).length > 0) {
        this.invoice.items.forEach(item => {
          if (productsInStock.hasOwnProperty(item._id) && productsInStock[item._id] < item.quantity) {
            // push error
            this.stockErrors.push(`${item.name} not enough in stock. Total Stock Available: ${productsInStock[item._id]}`);
          }
        });
      }
      return;
    }
    return;
  }

  private async updateStock() {
    let stock: StockHistory;
    let stockUpdates: Promise<any>[] = this.invoice.items.map(item => {
      stock = StockHistoryService.createStockForSale(item._id, this.store._id, item.quantity);
      return this.stockHistoryService.add(stock);
    });
    await Promise.all(stockUpdates);
    return;
  }
}