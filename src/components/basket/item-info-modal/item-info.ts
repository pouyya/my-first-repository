import { BasketItem } from './../../../model/basketItem';
import { NavParams, ViewController } from 'ionic-angular';
import { Component } from '@angular/core';

@Component({
  selector: 'item-info-modal',
  templateUrl: 'item-info.html'
})
export class ItemInfoModal {

  public purchaseableItem: BasketItem;
  public employeeHash: any;
  public settings: any;
  private bufferItem: BasketItem;

  constructor(
    private navParams: NavParams,
    private viewCtrl: ViewController
  ) {
    this.purchaseableItem = this.navParams.get("purchaseableItem");
    this.employeeHash = this.navParams.get("employeeHash");
    this.settings = this.navParams.get("settings");
    this.bufferItem = { ...this.purchaseableItem };
  }

  public dismiss() {
    this.viewCtrl.dismiss({ hasChanged: false, item: this.bufferItem, buffer: null });
  }

  public confirmChanges() {
    this.viewCtrl.dismiss({ hasChanged: true, item: this.purchaseableItem, buffer: this.bufferItem });
  }
}