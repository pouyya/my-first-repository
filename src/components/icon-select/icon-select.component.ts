import _ from 'lodash';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { icons } from './../../metadata/itemIcons';

@Component({
  selector: 'icon-select',
  templateUrl: 'icon-select.html'
})
export class IconSelectComponent {

  @Input() selectedIcon: string;
  @Output() confirmSelection: EventEmitter<any> = new EventEmitter<any>();
  public icons: Array<any>;

  constructor() {
    this.icons = _.values(icons);
  }

  public select() {
    this.confirmSelection.emit({ selectedIcon: this.selectedIcon });
  }

}