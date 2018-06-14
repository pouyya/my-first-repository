import { Component } from '@angular/core';
import { ViewController } from "ionic-angular";

@Component({
  selector: "select-location",
  templateUrl: "./select-location.html"
})
export class SelectLocationModal {

  constructor(
    private viewCtrl: ViewController) {
  }

  public dismiss() {
    this.viewCtrl.dismiss({ status: false, type: null });
  }

  public selectLocation(type) {
    this.viewCtrl.dismiss({ status: true, type });
  }

}