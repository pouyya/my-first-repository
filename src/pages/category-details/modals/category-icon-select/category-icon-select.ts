import { NavParams, ViewController } from 'ionic-angular';
import { Component } from '@angular/core';

@Component({
  selector: 'category-icon-select-modal',
  templateUrl: 'category-icon-select.html'
})
export class CategoryIconSelectModal {

  public selectedIcon: any;

  constructor(navParams: NavParams, viewCtrl: ViewController) {
    this.selectedIcon = navParams.get('selectedIcon');
  }

  public confirm() {

  }

  public dismiss() {
    
  }

}