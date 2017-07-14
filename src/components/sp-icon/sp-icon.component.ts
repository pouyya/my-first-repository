import { Component, Input } from '@angular/core';

@Component({
  selector: 'sp-icon',
  templateUrl: 'sp-icon.html'
})
export class SPIconComponent {

  @Input() sicon: any;

  constructor() {
    
  }
  
}