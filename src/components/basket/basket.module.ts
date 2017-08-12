import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BasketComponent } from './basket.component';
import { IonicPageModule } from 'ionic-angular';
import { SharedModule } from "../../modules/sharedModule";

@NgModule({
  declarations: [ BasketComponent ],
  imports: [
    CommonModule, 
    IonicPageModule.forChild(BasketComponent),
    SharedModule
  ],
  exports: [ BasketComponent ]
})
export class BasketModule { }