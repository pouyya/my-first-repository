import { IonicPageModule } from 'ionic-angular';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ImagePickerComponent } from "./image-picker.component";

@NgModule({
  declarations: [ ImagePickerComponent ],
  imports: [ 
    CommonModule, 
    IonicPageModule.forChild(ImagePickerComponent)
  ],
  exports: [ ImagePickerComponent ]
})
export class ImagePickerModule {

}