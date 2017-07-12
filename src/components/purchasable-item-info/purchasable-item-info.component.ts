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
    private calcService: CalculatorService
  ) { }

  public calculateDiscount(item: BucketItem) {
    item.discount = this.helperService.round2Dec(item.discount);
    item.finalPrice = item.discount > 0 ?
      this.calcService.calcItemDiscount(item.discount, item.actualPrice) :
      item.actualPrice;
  }

  public updatePrice(item: BucketItem) {
    item.discount = this.helperService.round2Dec(this.calcService.findDiscountPercent(item.actualPrice, item.finalPrice));
  }

  public addQuantity(item: BucketItem) {
    item.quantity = Number(item.quantity);
  }
}