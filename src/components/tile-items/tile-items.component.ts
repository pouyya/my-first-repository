import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'tile-items',
  templateUrl: 'tile-items.html',
  styleUrls: ['/components/tile-items/tile-items.scss']
})
export class TileItemsComponent {
  @Input() items: Array<any>;
  @Input() activeEmployee: any | null;
  @Output() onSelect = new EventEmitter<Object>();

  constructor() {}

  public selectItem(item) {
    this.onSelect.emit(item);
  }
}