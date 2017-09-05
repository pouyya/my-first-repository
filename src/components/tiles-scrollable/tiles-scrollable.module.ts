import { TileScrollableComponent } from './tiles-scrollable.component';
import { SharedModule } from './../../modules/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicPageModule } from 'ionic-angular';

@NgModule({
  declarations: [ TileScrollableComponent ],
  imports: [ 
    CommonModule, 
    IonicPageModule.forChild(TileScrollableComponent),
    SharedModule,
  ],
  exports: [ TileScrollableComponent ]
})
export class TileScrollableModule { }