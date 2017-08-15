import { SalesTax } from './../../model/salesTax';
import { PurchasableItemPriceInterface } from './../../model/purchasableItemPrice.interface';
import { Component } from '@angular/core';

class InteractableItemPrice {
  id: string;
  tax: any;
  item: PurchasableItemPriceInterface;
  isDefault: boolean;
}

@Component({
  selector: 'item-price-book',
  templateUrl: 'item-price-book.html'
})
export class ItemPriceBookComponent {

  public defaultPriceBook: InteractableItemPrice;
  public generalPriceBooks: Array<InteractableItemPrice> = [];
  public salesTaxes: Array<SalesTax> = [];

}