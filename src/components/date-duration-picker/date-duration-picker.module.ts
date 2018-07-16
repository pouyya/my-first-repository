import { IonicPageModule } from 'ionic-angular';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {DateDurationPickerComponent} from "./date-duration-picker.component";

@NgModule({
  declarations: [ DateDurationPickerComponent ],
  imports: [ 
    CommonModule, 
    IonicPageModule.forChild(DateDurationPickerComponent)
  ],
  exports: [ DateDurationPickerComponent ]
})
export class DateDurationPickerModule {

}