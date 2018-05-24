import { Component, Input, Output, EventEmitter } from '@angular/core';
import {SortablejsOptions} from "angular-sortablejs";
import {SelectColorModal} from "../color-picker/modal/select-color/select-color";
import {ModalController} from "ionic-angular";
import {SyncContext} from "../../services/SyncContext";

@Component({
  selector: 'tile-items',
  templateUrl: 'tile-items.html',
  styleUrls: ['/components/tile-items/tile-items.scss']
})
export class TileItemsComponent {
  @Input() allowDragSupport: boolean;
  @Input() items: Array<any>;
  @Input() activeEmployee: any | null;
  @Output() onSelect = new EventEmitter<Object>();
  @Output() onPositionChange = new EventEmitter();
  @Output() onColorSelected = new EventEmitter();

  public options: SortablejsOptions;
  constructor(private modalCtrl: ModalController, public syncContext: SyncContext) {
    this.options = {
        onUpdate: this.onItemChange.bind(this)
    };
  }

  public selectItem(item) {
    this.onSelect.emit(item);
  }

  private onItemChange(event: any){
    const sortedIds = this.items.map(item => item._id);
    this.onPositionChange.emit(sortedIds);
  }

  public async selectColor(id){
      let modal = this.modalCtrl.create(SelectColorModal);
      modal.onDidDismiss(data => {
          if(data && data.status) {
              this.onColorSelected.emit({ id, color : data.color });
          }
      });
      modal.present();
  }
}