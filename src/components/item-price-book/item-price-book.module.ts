import { IonicPageModule } from 'ionic-angular';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ItemPriceBookComponent } from './item-price-book.component';

@NgModule({
  declarations: [ ItemPriceBookComponent ],
  imports: [ 
    CommonModule, 
    IonicPageModule.forChild(ItemPriceBookComponent)
  ],
  exports: [ ItemPriceBookComponent ]
})
export class ItemPriceBookModule { }