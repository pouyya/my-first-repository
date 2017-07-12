import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconSelectComponent } from './icon-select.component';
import { IonicPageModule } from 'ionic-angular';

@NgModule({
  declarations: [ IconSelectComponent ],
  imports: [
    CommonModule, 
    IonicPageModule.forChild(IconSelectComponent)
  ],
  exports: [ IconSelectComponent ]
})
export class IconSelectModule {

}