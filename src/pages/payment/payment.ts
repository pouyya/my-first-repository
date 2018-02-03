import * as moment from 'moment';
import { GlobalConstants } from './../../metadata/globalConstants';
import { FountainService } from './../../services/fountainService';
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
  styleUrls: ['payment.scss'],
  providers: [SalesServices]
})
export class PaymentsPage {

  public sale: Sale
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
    private loading: LoadingController,
    private printService: PrintService) {

    let operation = navParams.get('operation');
    this.sale = <Sale>navParams.get('sale');
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
    if (!this.sale) {
      this.navCtrl.pop();
    } else {
      // check stock
      await this._checkForStockInHand();
      if (this.stockErrors.length > 0) {
        // display error message
        let alert = this.alertCtrl.create(
          {
            title: 'Out of Stock',
            subTitle: 'Please make changes to sale and continue',
            message: `${this.stockErrors.join('\n')}`,
            buttons: ['Ok']
          }
        );
        alert.present();
      }
    }
  }

  private async calculateBalance() {
    var totalPayments = 0;
    if (!this.doRefund) {
      if (this.sale.taxTotal > 0 && this.sale.payments && this.sale.payments.length > 0) {
        totalPayments = this.sale.payments
          .map(payment => payment.amount)
          .reduce((a, b) => a + b);
      }

      this.amount = this.sale.taxTotal - totalPayments;
      this.balance = this.amount;
      // Check for payment completion
      totalPayments >= this.sale.taxTotal && (await this.completeSale(totalPayments));
    } else {
      this.balance = this.amount = this.sale.taxTotal;
    }
  }

  public payWith() {
    let openModal = (component: Component, type: string) => {
      let modal = this.modalCtrl.create(component, {
        sale: this.sale,
        amount: Number(this.amount),
        refund: this.doRefund
      });
      modal.onDidDismiss(async data => {
        if (data && data.status) {
          await (this.doRefund ? this.completeRefund(data.data, type) : this.addPayment(type, data.data));
          await this.salesService.update(this.sale);
        }
      });
      modal.present();
    }
    return {
      cash: () => openModal(this.payTypes.cash.component, 'cash'),
      creditCard: () => openModal(this.payTypes.credit_card.component, 'credit_card')
    }
  }

  private async addPayment(type: string, payment: number) {
    if (!this.sale.payments) {
      this.sale.payments = [];
    }
    this.sale.payments.push({
      type: type,
      amount: Number(payment)
    });

    await this.calculateBalance();
  }

  private async completeRefund(payment: number, type: string) {
    var isCompleted: boolean = Math.abs(this.amount) === Math.abs(payment);
    if (isCompleted) {
      let loader = this.loading.create({ content: 'Processing Refund' });
      await loader.present();
      await this.salesService.updateStock(this.sale, this.store._id);
      this.sale.payments.push({
        type: type,
        amount: Number(payment) * -1
      });

      this.sale.state = 'refund';
      this.sale.completed = true;
      this.sale.completedAt = moment().utc().format();
      this.balance = 0;
      this.sale.receiptNo = await this.fountainService.getReceiptNumber();
      loader.dismiss();
      this.printSale();
    }
  }

  private async completeSale(payments: number) {
    let loader = this.loading.create({ content: 'Finalizing Sale' });
    await loader.present();
    await this.salesService.updateStock(this.sale, this.store._id);
    this.sale.completed = true;
    this.sale.completedAt = moment().utc().format();
    this.sale.state = 'completed';
    this.sale.receiptNo = await this.fountainService.getReceiptNumber();
    payments != 0 && (this.change = payments - this.sale.taxTotal);
    loader.dismiss();
    this.printSale();
  }

  public clearSale() {
    localStorage.removeItem('sale_id');
    this.goBack(true);
  }

  public async printSale() {
    if (this.store.printReceiptAtEndOfSale) {
      await this.printService.printReceipt(this.sale);
    }

    await this.printService.openCashDrawer();
  }

  public goBack(state: boolean = false) {
    this.navPopCallback(state).then(() => {
      this.navCtrl.pop();
    });
  }

  private async _checkForStockInHand() {
    this.stockErrors = [];
    let loader = this.loading.create({ content: 'Checking for stock...' });
    await loader.present();
    this.stockErrors = await this.salesService.checkForStockInHand(this.sale, this.store._id);
    loader.dismiss();
  }
}