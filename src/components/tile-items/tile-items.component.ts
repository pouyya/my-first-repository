import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AlertController, ActionSheetController } from 'ionic-angular';

@Component({
  selector: 'tile-items',
  templateUrl: 'tile-items.html',
  styleUrls: ['tile-items.scss']
})
export class TileItemsComponent {
  @Input() items: Array<any>;
  @Input() activeEmployee: any | null;
  @Output() onSelect = new EventEmitter<Object>();

  constructor(
    private alertController: AlertController,
    private actionSheetCtrl: ActionSheetController
  ) { }

  public selectItem(item) {
    this.onSelect.emit(item);
  }
}