import { NavParams, ViewController } from 'ionic-angular';
import { Component } from '@angular/core';

@Component({
  selector: 'category-icon-select-modal',
  templateUrl: 'category-icon-select.html'
})
export class CategoryIconSelectModal {

  public selectedIcon: string;
  public bufferedSelection: string;

  constructor(private navParams: NavParams, private viewCtrl: ViewController) {
    this.selectedIcon = navParams.get('selectedIcon');
  }

  public confirm() {
    this.selectedIcon = this.bufferedSelection;
    this.viewCtrl.dismiss(this.selectedIcon);
  }

  public dismiss() {
    this.viewCtrl.dismiss(this.selectedIcon);
  }

}