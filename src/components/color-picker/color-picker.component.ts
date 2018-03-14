
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ModalController } from "ionic-angular";
import { SelectColorModal } from "./modal/select-color/select-color";

@Component({
  selector: 'color-picker',
  template: `<button float-left ion-button small type="button" (click)="selectColor()">Select Color</button>
  <span float-left [style.background-color]="selectedColor" class="btn-color">{{selectedColor ? "" : "No color"}}</span>`,
  styles: [
    `span.btn-color {
          width:30px;height: 30px; margin-left: 10px;
    }`
  ]
})
export class ColorPickerComponent {
  @Input() selectedColor: string;
  @Output() selectedColorUpdated = new EventEmitter();
  constructor(private modalCtrl: ModalController) {
  }

  public selectColor() {
    let modal = this.modalCtrl.create(SelectColorModal);
    modal.onDidDismiss(data => {
      if(data.status) {
        this.selectedColor = data.color;
        this.selectedColorUpdated.emit(data.color);
      }
    });
    modal.present();
  }
}