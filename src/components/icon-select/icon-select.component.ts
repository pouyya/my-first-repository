import _ from 'lodash';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { icons } from '@simplepos/core/dist/metadata/itemIcons';

@Component({
  selector: 'icon-select',
  templateUrl: 'icon-select.html'
})
export class IconSelectComponent {

  @Input() selectedIcon: string;
  @Output() confirmSelection: EventEmitter<any> = new EventEmitter<any>();
  public icons: Array<any>;
  private noIcon: string = "No icon";

  constructor() {
    this.icons = _.values(icons);
    this.icons.unshift({name: 'No icon', type: ''});
  }

  public ngAfterViewInit() {
    !this.selectedIcon && ( this.selectedIcon = this.noIcon );
  }

  public select() {
    this.confirmSelection.emit({ selectedIcon: this.selectedIcon });
  }

}