import { IonicPageModule } from 'ionic-angular';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ColorPickerComponent } from "./color-picker.component";

@NgModule({
  declarations: [ ColorPickerComponent ],
  imports: [ 
    CommonModule, 
    IonicPageModule.forChild(ColorPickerComponent)
  ],
  exports: [ ColorPickerComponent ]
})
export class ColorPickerModule {

}