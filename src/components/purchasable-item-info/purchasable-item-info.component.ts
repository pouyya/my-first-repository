import { TaxService } from './../../services/taxService';
import { CalculatorService } from './../../services/calculatorService';
import { HelperService } from './../../services/helperService';
import { BasketItem } from './../../model/bucketItem';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'purchasable-item-info',
  templateUrl: 'purchasable-item-info.html',
  styles: [`.scrollable-component {
    overflow-y: auto;
    height: 200px;
  }`]
})
export class PurchasableItemInfoComponent {

  @Input() item: BasketItem;
  @Input() employeeHash: any;
  @Input() settings: any;

  constructor(
    private helperService: HelperService,
    private calcService: CalculatorService,
    private taxService: TaxService
  ) {}

  public calculateDiscount(item: BasketItem) {
    item.discount = this.helperService.round2Dec(Number(item.discount));
    item.finalPrice = this.calcService.calcItemDiscount(item.discount, item.actualPrice);
  }

  public updatePrice(item: BasketItem) {
    item.finalPrice = Number(item.finalPrice);
    item.discount = this.helperService.round2Dec(this.calcService.findDiscountPercent(item.actualPrice, item.finalPrice));
  }

  public addQuantity(item: BasketItem) {
    item.quantity = Number(item.quantity);
  }
}