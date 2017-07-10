import { BucketItem } from './../../../model/bucketItem';
import { NavParams, ViewController } from 'ionic-angular';
import { Component } from '@angular/core';

@Component({
  selector: 'item-info-modal',
  templateUrl: 'item-info.html'
})
export class ItemInfoModal {

  public purchaseableItem: BucketItem;
  private bufferItem: BucketItem;

  constructor(
    private navParams: NavParams,
    private viewCtrl: ViewController
  ) {
    this.purchaseableItem = this.navParams.get("purchaseableItem");
    this.bufferItem = { ...this.purchaseableItem };
  }

  public dismiss() {
    this.viewCtrl.dismiss({ hasChanged: false, item: this.bufferItem });
  }

  public confirmChanges() {
    this.viewCtrl.dismiss({ hasChanged: true, item: this.purchaseableItem });
  }
}