import { ViewController, NavParams } from 'ionic-angular';
import { Component } from '@angular/core';

@Component({
  selector: 'select-roles-modal',
  templateUrl: 'select-roles.html'
})
export class SelectRolesModal {

  public store: any;

  constructor(
    private navParams: NavParams,
    private viewCtrl: ViewController
  ) {
    this.store = this.navParams.get('store');
  }

  public dismiss() {
    this.viewCtrl.dismiss();
  }
}