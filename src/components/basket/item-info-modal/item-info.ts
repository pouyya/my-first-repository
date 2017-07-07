import { BucketItem } from './../../../model/bucketItem';
import { NavParams, ViewController } from 'ionic-angular';
import { Component } from '@angular/core';

@Component({
  selector: 'item-info-modal',
  templateUrl: 'item-info.html'
})
export class ItemInfoModal {

  public purchaseableItem: BucketItem;

  constructor(
    private navParams: NavParams,
    private viewCtrl: ViewController
  ) {
    this.purchaseableItem = this.navParams.get("purchaseableItem");
  }

  public confirmChanges() {
    this.viewCtrl.dismiss();
  }
}