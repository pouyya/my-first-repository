import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TileItemsComponent } from './tile-items.component';
import { IonicPageModule } from 'ionic-angular';
import { MdGridListModule } from '@angular/material';

@NgModule({
  declarations: [ TileItemsComponent ],
  imports: [ 
    CommonModule, 
    IonicPageModule.forChild(TileItemsComponent),
    MdGridListModule
  ],
  exports: [ TileItemsComponent ]
})
export class TileItemsModule { }