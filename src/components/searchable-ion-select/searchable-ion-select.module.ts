import { SearchableIonSelectComponent } from './searchable-ion-select.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicPageModule } from 'ionic-angular';
import { SearchableIonSelectView } from './searchable-ion-select-view/searchable-ion-select-view';

@NgModule({
  declarations: [
    SearchableIonSelectComponent,
    SearchableIonSelectView
  ],
  imports: [
    CommonModule, 
    IonicPageModule.forChild(SearchableIonSelectComponent),
    IonicPageModule.forChild(SearchableIonSelectView)
  ],
  exports: [
    SearchableIonSelectComponent,
    SearchableIonSelectView
  ]
})
export class SearchableIonSelectModule {

}