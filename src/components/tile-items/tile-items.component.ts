import { Component, Input, Output, EventEmitter } from '@angular/core';
import {SortablejsOptions} from "angular-sortablejs";

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

  public options: SortablejsOptions;
  constructor() {
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
}