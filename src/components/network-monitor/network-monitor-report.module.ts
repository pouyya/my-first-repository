import { SharedModule } from './../../modules/shared.module';
import { IonicPageModule } from 'ionic-angular';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NetworkMonitorReportComponent } from './network-monitor-report.component';

@NgModule({
  declarations: [NetworkMonitorReportComponent],
  imports: [
    CommonModule,
    IonicPageModule.forChild(NetworkMonitorReportComponent),
    SharedModule
  ],
  exports: [NetworkMonitorReportComponent]
})
export class NetworkMonitorReportModule {

}