import { SharedModule } from './../../modules/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BasketComponent } from './basket.component';
import { IonicPageModule } from 'ionic-angular';

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