import { BucketItem } from './../../model/bucketItem';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'purchasable-item-info',
  templateUrl: 'purchasable-item-info.html'
})
export class PurchasableItemInfoComponent {

  @Input() item: BucketItem;
  public text: string;

  constructor() {
    try {
      this.text = JSON.stringify(this.item);
    } catch(e) {
      console.error(e);
    }
  }
}