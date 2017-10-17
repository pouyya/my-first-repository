import { SharedModule } from './../../modules/shared.module';
import { IonicPageModule } from 'ionic-angular';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PurchasableItemPriceComponent } from './purchasable-item-price.component';

@NgModule({
  declarations: [ PurchasableItemPriceComponent ],
  imports: [ 
    CommonModule, 
    IonicPageModule.forChild(PurchasableItemPriceComponent),
    SharedModule
  ],
  exports: [ PurchasableItemPriceComponent ]
})
export class PurchasableItemPriceModule { }