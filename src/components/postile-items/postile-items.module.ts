import { SharedModule } from './../../modules/shared.module';
import { SPIconModule } from './../sp-icon/sp-icon.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { POSTileItemsComponent } from './postile-items.component';
import { IonicPageModule } from 'ionic-angular';
import { DndModule } from 'ng2-dnd';
import { SortablejsModule } from 'angular-sortablejs';

@NgModule({
  declarations: [ POSTileItemsComponent ],
  imports: [ 
    CommonModule, 
    IonicPageModule.forChild(POSTileItemsComponent),
    SPIconModule,
    DndModule,
    SharedModule,
    SortablejsModule
  ],
  exports: [ POSTileItemsComponent ]
})
export class POSTileItemsModule { }