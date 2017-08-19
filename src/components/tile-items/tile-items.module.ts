import { SPIconModule } from './../sp-icon/sp-icon.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TileItemsComponent } from './tile-items.component';
import { IonicPageModule } from 'ionic-angular';
import { MdGridListModule } from '@angular/material';
import { DragulaModule } from 'ng2-dragula/ng2-dragula';
import { DndModule } from 'ng2-dnd';

@NgModule({
  declarations: [ TileItemsComponent ],
  imports: [ 
    CommonModule, 
    IonicPageModule.forChild(TileItemsComponent),
    MdGridListModule,
    SPIconModule,
    DragulaModule,
    DndModule
  ],
  exports: [ TileItemsComponent ]
})
export class TileItemsModule { }