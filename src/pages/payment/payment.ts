import { SalesServices } from './../../services/salesService';
import { Component } from "@angular/core";
import { NavController, NavParams, ModalController, LoadingController, AlertController } from "ionic-angular";
import { Sale } from "../../model/sale";
import { CashModal } from './modals/cash/cash';
import { CreditCardModal } from './modals/credit-card/credit-card';
import { PrintService } from '../../services/printService';
import { PaymentService } from '../../services/paymentService';
import { SyncContext } from "../../services/SyncContext";
import { ProductService } from "../../services/productService";
import {SplitPaymentPage} from "../split-payment/split-payment";

@Component({
  selector: 'payment',
  templateUrl: 'payment.html',
  providers: [SalesServices]
})
export class PaymentsPage {

  public sale: Sale;
  public amount: number;
  public change: number;
  public doRefund: boolean;
  public stockErrors: any[] = [];
  public payTypes: any = {
    'cash': { text: 'Cash', component: CashModal },
    'credit_card': { text: 'Credit Card', component: CreditCardModal }
  };
  private navPopCallback: any;
  private moneySplit: any[] = [];

  constructor(
    private salesService: SalesServices,
    private paymentService: PaymentService,
    private productService: ProductService,
    private navCtrl: NavController,
    private navParams: NavParams,
    private modalCtrl: ModalController,
    private loading: LoadingController,
    private printService: PrintService,
    private syncContext: SyncContext,
    private alertController: AlertController) {
  }

  async ionViewDidLoad() {
    this.sale = <Sale>this.navParams.get('sale');
    this.doRefund = this.navParams.get('doRefund');
    this.navPopCallback = this.navParams.get("callback");
    this.amount = 0;
    this.change = 0;
    await this.calculateBalance(this.sale);
  }

  async ionViewDidEnter() {
    if (!this.sale) {
      this.navCtrl.pop();
    } else {
      await this.checkForStockInHand();
    }
  }

  private async calculateBalance(sale: Sale) {

    let loader = this.loading.create({ content: 'Finalizing Sale' });
    loader.present();

    var totalPayments = 0;
    if (sale.taxTotal != 0 && sale.payments && sale.payments.length > 0) {
      totalPayments = sale.payments
        .map(payment => payment.amount)
        .reduce((a, b) => a + b);
    }

    this.amount = sale.taxTotal - totalPayments;

    if (Math.abs(totalPayments) >= Math.abs(sale.taxTotal)) {
      await this.completeSale(totalPayments)
    }

    loader.dismiss();
  }

  public payWithCard() {
    this.openModal(this.payTypes.credit_card.component, 'credit_card')
  }

  public payWithCash() {
    this.openModal(this.payTypes.cash.component, 'cash');
  }

  public splitPayment() {
    this.moneySplit = [this.amount];
    this.navCtrl.push(SplitPaymentPage, {
      sale: this.sale, moneySplit: this.moneySplit, splitCallback: this.splitCallback.bind(this)
    });
  }
  private async splitCallback (data) {
      if (data) {
          if (data.type === 'PAY' && data.values.length) {
              data.values.forEach(payment => {
                  this.addPayment('cash', payment.amount);
              });
              await this.calculateBalance(this.sale);
              await this.salesService.update(this.sale);
          }
          this.moneySplit = data.moneySplit;
      }
  }

  private openModal(component: Component, type: string) {
    let modal = this.modalCtrl.create(component, {
      sale: this.sale,
      amount: Number(this.amount),
      refund: this.doRefund
    });
    modal.onDidDismiss(async data => {
      if (data && data.status) {
        this.addPayment(type, data.data);
        await this.calculateBalance(this.sale);
        await this.salesService.update(this.sale);
      }
    });
    modal.present();
  }

  private addPayment(type: string, payment: number) {
    if (!this.sale.payments) {
      this.sale.payments = [];
    }
    this.sale.payments.push({
      type: type,
      amount: Number(payment)
    });
  }

  private async completeSale(payments: number) {
    await this.paymentService.completePayment(this.sale, this.syncContext.currentStore._id, this.doRefund);
    payments != 0 && (this.change = payments - this.sale.taxTotal);
    try {
      this.printSale(false);
      await this.printService.printProductionLinePrinter(this.sale);
    } catch (error) { }
  }

  public clearSale() {
    localStorage.removeItem('sale_id');
    this.goBack(true);
  }

  public async printSale(forcePrint: boolean) {
    if (this.syncContext.currentStore.printReceiptAtEndOfSale || forcePrint) {
      await this.printService.printReceipt(this.sale);
    }

    await this.printService.openCashDrawer();
  }

  public goBack(state: boolean = false) {
    this.navPopCallback(state).then(() => {
      this.navCtrl.pop();
    });
  }

  private async checkForStockInHand() {

    const stockEnabledItems = this.productService.getStockEnabledItems(this.sale.items);

    if (stockEnabledItems.length) {

      let loader = this.loading.create({ content: 'Checking Stocks...' });
      await loader.present();

      this.stockErrors = await this.salesService.checkForStockInHand(stockEnabledItems, this.syncContext.currentStore._id);
      loader.dismiss();

      if (this.stockErrors && this.stockErrors.length > 0) {
        let alert = this.alertController.create(
          {
            title: 'Out of Stock',
            subTitle: 'Please make changes to sale and continue',
            message: `${this.stockErrors.join('\n')}`,
            buttons: ['Ok'],
          }
        );
        alert.present();
      }
    }
  }
}