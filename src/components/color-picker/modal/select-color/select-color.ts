import { Component } from '@angular/core';
import { ViewController } from "ionic-angular";

@Component({
  selector: "select-color",
  templateUrl: "./select-color.html"
})
export class SelectColorModal {

  public colors: Array<any> = [
    "#FFF", '#ea963a', '#ffe623', '#246489', '#9df0ff', '#ff8364', '#ff2bf4', '#1cff85', '#ffdfff', '#9eac9f', '#ffd51c'
  ]

  constructor(
    private viewCtrl: ViewController) {
  }

  public dismiss() {
    this.viewCtrl.dismiss({ status: false, color: null });
  }

  public selectColor(color) {
    this.viewCtrl.dismiss({ status: true, color: color });
  }

}