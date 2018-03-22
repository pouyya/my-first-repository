import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ModalController } from "ionic-angular";
import { SelectColorModal } from "./modal/select-color/select-color";
import { Subject } from "rxjs/Subject";

@Component({
  selector: 'color-picker',
  template: `<button float-left ion-button small type="button" (click)="selectColor()">Select Color</button>
  <span float-left [style.background-color]="selectedColor$ | async" class="btn-color">{{selectedColor$ ? "" : "No color"}}</span>`,
  styleUrls: ['/components/color-picker.scss']
})
export class ColorPickerComponent {
  @Input() selectedColor$: Subject<String>;
  constructor(private modalCtrl: ModalController) {
  }

  public selectColor() {
    let modal = this.modalCtrl.create(SelectColorModal);
    modal.onDidDismiss(data => {
      if(data.status) {
        this.selectedColor$.next(data.color);
      }
    });
    modal.present();
  }
}