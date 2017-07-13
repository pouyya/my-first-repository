import _ from 'lodash';
import { Component, Input } from '@angular/core';
import { icons } from './../../metadata/itemIcons';

@Component({
  selector: 'icon-select',
  templateUrl: 'icon-select.html'
})
export class IconSelectComponent {

  @Input() selectedIcon: string;
  public icons: Array<any>;

  constructor() {
    // TODO: Need to check why 'KeysPipe' isn't working here
    // Therefore, had to convert icons object into array of objects so it can be looped
    this.icons = _.values(icons);
    this.icons.forEach((icon, index, array) => {
      if(icon.type == 'svg' && icon.hasOwnProperty('noOfPaths')) {
        let paths = [];
        for(let i = 1; i <= icon.noOfPaths; i++) {
          paths.push(i);
        }
        array[index].noOfPaths = paths;
      }
    });
  }

}