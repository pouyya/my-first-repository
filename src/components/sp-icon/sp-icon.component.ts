import { Component, Input } from '@angular/core';

@Component({
  selector: 'sp-icon',
  templateUrl: 'sp-icon.html'
})
export class SPIconComponent {

  public spIcon: any;
  public paths: Array<any> = [];
  @Input('icon')
  set model(_icon) {
    this.spIcon = _icon;
    if (this.spIcon && this.spIcon.type == 'svg' && this.spIcon.hasOwnProperty('noOfPaths') && this.spIcon.noOfPaths > 0) {
      this.paths = Array(this.spIcon.noOfPaths).fill(1).map((x, i) => ++i);
    }    
  }
  get model() {
    return this.spIcon;
  }

  constructor() {

  }

}