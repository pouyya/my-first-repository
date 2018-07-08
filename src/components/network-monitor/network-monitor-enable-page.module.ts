import { SharedModule } from './../../modules/shared.module';
import { IonicPageModule } from 'ionic-angular';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NetworkMonitorEnablePageComponent } from './network-monitor-enable-page.component';

@NgModule({
  declarations: [NetworkMonitorEnablePageComponent],
  imports: [
    CommonModule,
    IonicPageModule.forChild(NetworkMonitorEnablePageComponent),
    SharedModule
  ],
  exports: [NetworkMonitorEnablePageComponent]
})
export class NetworkMonitorEnablePageModule {

}