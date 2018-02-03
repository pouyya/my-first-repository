import _ from 'lodash';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'tiles-scrollable',
  templateUrl: 'tiles-scrollable.html',
  styleUrls: ['tiles-scrollable.scss']
})
export class TileScrollableComponent {

  public selected: any = null;

  @Input() elements: Array<any>;
  @Input() displayProperty: string;
  @Input('selectedElement')
  set prop(elm: any) {
    this.selected = elm;
  }
  get prop() {
    return this.selected;
  }
  @Output() notifyChange: EventEmitter<any> = new EventEmitter<any>();

  public toggle(element: any): void {
    if (!element.disabled) {
      if (element.selected) {
        element.selected = false;
        this.selected = null;
      } else {
        if (this.selected) {
          let index = _.findIndex(this.elements, _employee => _employee.selected);
          index > -1 && (this.elements[index].selected = false);
        }
        element.selected = true;
        this.selected = element;
      }

      this.notifyChange.emit({ selected: this.selected });
    }
  }

}