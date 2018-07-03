// 
import { Component, Renderer } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-delete-shift-modal',
  templateUrl: 'delete-shift-modal.html',
})
export class DeleteShiftModalPage {
  public empName: string;

  constructor(public renderer: Renderer, public viewCtrl: ViewController, public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    this.renderer.setElementClass(this.viewCtrl.pageRef().nativeElement, 'deleteShiftModal', true);
    this.empName = this.navParams.get('empName');
  }

  dismiss(decision: boolean){
    this.viewCtrl.dismiss(decision);
  }

}
