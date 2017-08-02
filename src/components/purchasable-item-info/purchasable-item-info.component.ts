import { TaxService } from './../../services/taxService';
import { CalculatorService } from './../../services/calculatorService';
import { HelperService } from './../../services/helperService';
import { BucketItem } from './../../model/bucketItem';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'purchasable-item-info',
  templateUrl: 'purchasable-item-info.html'
})
export class PurchasableItemInfoComponent {

  @Input() item: BucketItem;

  constructor(
    private helperService: HelperService,
    private calcService: CalculatorService,
    private taxService: TaxService
  ) { }

  public calculateDiscount(item: BucketItem) {
    item.discount = this.helperService.round2Dec(Number(item.discount));
    item.finalPrice = this.calcService.calcItemDiscount(item.discount, item.actualPrice);
  }

  public updatePrice(item: BucketItem) {
    item.finalPrice = Number(item.finalPrice);
    item.finalPrice = item.isTaxIncl ? this.taxService.calculate(item.finalPrice, item.tax.rate) : item.finalPrice;
    item.discount = this.helperService.round2Dec(this.calcService.findDiscountPercent(item.actualPrice, item.finalPrice));
  }

  public addQuantity(item: BucketItem) {
    item.quantity = Number(item.quantity);
  }
}