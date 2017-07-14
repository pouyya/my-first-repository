import _ from 'lodash';
import { Component, Input } from '@angular/core';
import { icons } from './../../metadata/itemIcons';

@Component({
  selector: 'icon-select',
  templateUrl: 'icon-select.html'
})
export class IconSelectComponent {

  public name: string;
  public icons: Array<any>;
  @Input('selectedIcon')
  set model(name: string) {
    this.name = name;
  }
  get model() {
    return this.name;
  }  

  constructor() {
    this.icons = _.values(icons);
  }

}