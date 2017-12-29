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
    this.bufferedSelection = this.selectedIcon = navParams.get('selectedIcon');
  }

  public confirm() {
    this.viewCtrl.dismiss({ status: true, selected: this.bufferedSelection });
  }

  public dismiss() {
    this.viewCtrl.dismiss({ status: false, selected: null });
  }

  public confirmSelection(event) {
    this.bufferedSelection = event.selectedIcon;
  }

}