import { SharedModule } from './../../modules/shared.module';
import { SPIconModule } from './../sp-icon/sp-icon.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TileItemsComponent } from './tile-items.component';
import { IonicPageModule } from 'ionic-angular';
import { MdGridListModule } from '@angular/material';
import { DndModule } from 'ng2-dnd';

@NgModule({
  declarations: [ TileItemsComponent ],
  imports: [ 
    CommonModule, 
    IonicPageModule.forChild(TileItemsComponent),
    MdGridListModule,
    SPIconModule,
    DndModule,
    SharedModule
  ],
  exports: [ TileItemsComponent ]
})
export class TileItemsModule { }