import { SharedModule } from './../../modules/shared.module';
import { IonicPageModule } from 'ionic-angular';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NetworkMonitorComponent } from './network-monitor.component';

@NgModule({
  declarations: [NetworkMonitorComponent],
  imports: [
    CommonModule,
    IonicPageModule.forChild(NetworkMonitorComponent),
    SharedModule
  ],
  exports: [NetworkMonitorComponent]
})
export class NetworkMonitorModule {

}