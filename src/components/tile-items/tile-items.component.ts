import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AlertController } from 'ionic-angular';

@Component({
  selector: 'tile-items',
  templateUrl: 'tile-items.html',
  styleUrls: ['/components/tile-items/tile-items.scss']
})
export class TileItemsComponent {
  @Input() items: Array<any>;
  @Output() onSelect = new EventEmitter<Object>();

  constructor(private alertController: AlertController) { }

  public selectItem(item) {
    this.onSelect.emit(item);
  }
}