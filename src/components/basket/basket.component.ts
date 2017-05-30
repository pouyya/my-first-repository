import { SalesServices } from './../../services/salesService';
import { CalculatorService } from './../../services/calculatorService';
import { TaxService } from './../../services/taxService';
import { Sale } from './../../model/sale';
import { PurchasableItem } from './../../model/purchasableItem';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import { BucketItem } from './../../model/bucketItem';

@Component({
  selector: 'basket',
  templateUrl: 'basket.html',
  styleUrls: ['/components/basket/basket.scss'],
  providers: [SalesServices, TaxService, CalculatorService]
})
export class BasketComponent {
  public invoice: Sale;

  @Input('_invoice')
  set model(obj: Sale) {
    this.invoice = obj;
  }
  get model(): Sale { return this.invoice; }  

  @Output() paymentClicked = new EventEmitter<boolean>();

  public tax: number;
  public oldValue: number = 1;
  private shownItem: any = null;

  constructor(
    private salesService: SalesServices,
    private taxService: TaxService,
    private calcService: CalculatorService
  ) {
    this.tax = this.taxService.getTax();
  }

  public addItemToBasket(item: PurchasableItem) {
    let bucketItem = this.salesService.prepareBucketItem(item);
    this.invoice.items.push(bucketItem);
    this.calculateTotal();
    this.salesService.update(this.invoice);
  }

  public removeItem(item: BucketItem, $index) {
    this.invoice.items.splice($index, 1);
    this.calculateTotal();
    this.salesService.update(this.invoice);
  }

  public updatePrice(item: BucketItem) {
    item.discount = this.calcService.findDiscountPercent(item.actualPrice, item.finalPrice);
    this.calculateTotal();
    this.salesService.update(this.invoice);
  }

  public calculateDiscount(item: BucketItem) {
    item.finalPrice = item.discount > 0 ?
      this.calcService.calcItemDiscount(item.discount, item.actualPrice) :
      item.actualPrice;
    this.calculateTotal();
    this.salesService.update(this.invoice);
  }

  public addQuantity(item: BucketItem) {
    this.calculateTotal();
    this.salesService.update(this.invoice);
  }

  public syncInvoice() {
    setTimeout(() => {
      this.salesService.update(this.invoice).then(
        response => console.log(response)
      ).catch(error => console.error(error));
    }, 100);
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

  public calculateTotal() {
    setTimeout(() => {
      if(this.invoice.items.length > 0) {
        this.invoice.subTotal = this.invoice.totalDiscount = 0;
        this.invoice.items.forEach(item => {
          this.invoice.subTotal += (item.finalPrice * item.quantity);
          this.invoice.totalDiscount += ((item.actualPrice - item.finalPrice) * item.quantity);
        });
        this.invoice.taxTotal = this.taxService.calculate(this.invoice.subTotal);
      } else {
        this.invoice.subTotal = this.invoice.taxTotal = this.invoice.totalDiscount = 0;
      }
    }, 0);
  }
}