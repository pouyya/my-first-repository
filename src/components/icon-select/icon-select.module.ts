import { SPIconModule } from './../sp-icon/sp-icon.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconSelectComponent } from './icon-select.component';
import { IonicPageModule } from 'ionic-angular';

@NgModule({
  declarations: [ IconSelectComponent ],
  imports: [
    CommonModule, 
    IonicPageModule.forChild(IconSelectComponent),
    SPIconModule
  ],
  exports: [ IconSelectComponent ]
})
export class IconSelectModule {

}