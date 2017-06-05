import { HelperService } from './../../services/helperService';
import { Platform } from 'ionic-angular';
import { SalesServices } from './../../services/salesService';
import { CalculatorService } from './../../services/calculatorService';
import { TaxService } from './../../services/taxService';
import { Sale } from './../../model/sale';
import { PurchasableItem } from './../../model/purchasableItem';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BucketItem } from './../../model/bucketItem';

@Component({
  selector: 'basket',
  templateUrl: 'basket.html',
  styleUrls: ['/components/basket/basket.scss'],
  providers: [SalesServices, TaxService, CalculatorService]
})
export class BasketComponent {

  public invoice: Sale;
  public tax: number;
  public oldValue: number = 1;
  private shownItem: any = null;
  public disablePayBtn = false;
  public balance: number = 0;

  @Input('_invoice')
  set model(obj: Sale) {
    this.invoice = obj;
    this.setBalance();
  }
  get model(): Sale { return this.invoice; }

  @Output() paymentClicked = new EventEmitter<boolean>();

  constructor(
    private salesService: SalesServices,
    private taxService: TaxService,
    private calcService: CalculatorService,
    private platform: Platform,
    private helper: HelperService
  ) {
    this.tax = this.taxService.getTax();
  }

  ionViewDidEnter() {
    this.platform.ready().then(() => {
      this.setBalance();
    });
  }

  private setBalance() {
    if (this.invoice.payments && this.invoice.payments.length > 0) {
      // disable the pay button if all payments were made
      let balance = this.invoice.taxTotal - this.invoice.payments
        .map(payment => payment.amount)
        .reduce((a, b) => a + b);
      balance < 1 && (this.disablePayBtn = true);
      this.balance = balance;
    } else {
      this.balance = this.invoice.taxTotal;
    }
  }

  private calculateAndSync() {
    this.calculateTotal(() => {
      this.setBalance();
      this.salesService.update(this.invoice)
    });
  }

  public addItemToBasket(item: PurchasableItem) {
    let bucketItem = this.salesService.prepareBucketItem(item);
    this.invoice.items.push(bucketItem);
    this.calculateAndSync();
  }

  public removeItem(item: BucketItem, $index) {
    this.invoice.items.splice($index, 1);
    this.calculateAndSync();
  }

  public updatePrice(item: BucketItem) {
    item.discount = this.calcService.findDiscountPercent(item.actualPrice, item.finalPrice);
    this.calculateAndSync();
  }

  public calculateDiscount(item: BucketItem) {
    item.discount = this.helper.round2Dec(item.discount);
    item.finalPrice = item.discount > 0 ?
      this.calcService.calcItemDiscount(item.discount, item.actualPrice) :
      item.actualPrice;
    this.calculateAndSync();
  }

  public addQuantity(item: BucketItem) {
    this.calculateAndSync();
  }

  public syncInvoice() {
    return this.salesService.update(this.invoice).then(
      response => console.log(response)
    ).catch(error => console.error(error));
  }

  public toggleItem(id: string): void {
    this.shownItem = this.isItemShown(id) ? null : id;
  }

  public isItemShown(id: string): boolean {
    return this.shownItem === id;
  }

  public gotoPayment() {
    this.paymentClicked.emit(true);
  }

  public calculateTotal(callback) {
    setTimeout(() => {
      if (this.invoice.items.length > 0) {
        this.invoice.subTotal = this.invoice.totalDiscount = 0;
        this.invoice.items.forEach(item => {
          this.invoice.subTotal += (item.finalPrice * item.quantity);
          this.invoice.totalDiscount += ((item.actualPrice - item.finalPrice) * item.quantity);
        });
        this.invoice.taxTotal = this.helper.round2Dec(this.taxService.calculate(this.invoice.subTotal));
        let roundedTotal = this.helper.round10(this.invoice.taxTotal, -1);
        this.invoice.round = roundedTotal - this.invoice.taxTotal;
        this.invoice.taxTotal = roundedTotal;
        callback();
      } else {
        this.invoice.subTotal = 0;
        this.invoice.taxTotal = 0;
        this.invoice.round = 0;
        this.invoice.totalDiscount = 0;
        callback();
      }
    }, 0);
  }
}