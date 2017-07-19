import { IonicPageModule } from 'ionic-angular';
import { CommonModule } from '@angular/common';
import { SPIconComponent } from './sp-icon.component';
import { NgModule } from '@angular/core';

@NgModule({
  declarations: [ SPIconComponent ],
  imports: [ 
    CommonModule, 
    IonicPageModule.forChild(SPIconComponent)
  ],
  exports: [ SPIconComponent ]
})
export class SPIconModule { }