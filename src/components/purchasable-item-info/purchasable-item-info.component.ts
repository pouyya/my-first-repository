import { CalculatorService } from './../../services/calculatorService';
import { HelperService } from './../../services/helperService';
import { BasketItem } from './../../model/basketItem';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'purchasable-item-info',
  templateUrl: 'purchasable-item-info.html',
  styleUrls: ['/component/purchasable-item-info/purchasable-item-info.scss']
})
export class PurchasableItemInfoComponent {

  @Input() item: BasketItem;
  @Input() employeeHash: any;
  @Input() settings: any;

  constructor(
    private helperService: HelperService,
    private calcService: CalculatorService
  ) { }

  public calculateDiscount(item: BasketItem) {
    item.discount = this.helperService.round2Dec(Number(item.discount));
    item.finalPrice = this.calcService.calcItemDiscount(item.systemPrice, item.discount);
    item.modifierItems.forEach((modifier,i) => {
      modifier.discount=item.discount;
      modifier.finalPrice= this.calcService.calcItemDiscount(modifier.systemPrice, modifier.discount);
      item.modifierItems[i]=modifier;
    });
  }

  public updatePrice(item: BasketItem) {
    item.finalPrice = Number(item.finalPrice);
    
    if (item.systemPrice !== 0) {
      item.discount = this.helperService.round2Dec(this.calcService.findDiscountPercent(item.systemPrice, item.finalPrice));
    } else {
      item.manualPrice = item.finalPrice;
    }
  }

  public addQuantity(item: BasketItem) {
    item.quantity = Number(item.quantity);
  }

  public removeModifier(index) {
    this.item.modifierItems.splice(index, 1);
  }
}