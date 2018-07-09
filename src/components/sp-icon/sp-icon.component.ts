import { Component, Input } from '@angular/core';

@Component({
  selector: 'sp-icon',
  templateUrl: 'sp-icon.html',
  styleUrls: ['/components/sp-icon.scss']
})
export class SPIconComponent {

  public spIcon: any;
  public paths: Array<any> = [];
  @Input('icon')
  set model(_icon) {
    this.spIcon = _icon;
  }
  get model() {
    return this.spIcon;
  }
}