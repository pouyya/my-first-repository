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
    this.bufferedSelection = this.selectedIcon = this.navParams.get('selectedIcon');
  }

  public dismiss() {
    this.viewCtrl.dismiss({ status: false, selected: null });
  }

  public confirmSelection(event) {
    this.viewCtrl.dismiss({ status: true, selected: event.selectedIcon });
  }

}