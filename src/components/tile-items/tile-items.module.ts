import { SharedModule } from './../../modules/shared.module';
import { SPIconModule } from './../sp-icon/sp-icon.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TileItemsComponent } from './tile-items.component';
import { IonicPageModule } from 'ionic-angular';
import { DndModule } from 'ng2-dnd';
import { SortablejsModule } from 'angular-sortablejs';
import {SyncContext} from "../../services/SyncContext";

@NgModule({
  declarations: [ TileItemsComponent ],
  imports: [ 
    CommonModule, 
    IonicPageModule.forChild(TileItemsComponent),
    SPIconModule,
    DndModule,
    SharedModule,
    SortablejsModule
  ],
  exports: [ TileItemsComponent ]
})
export class TileItemsModule { }