import { GroupEmployeeTimeLog } from './group-employee-timelog.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicPageModule } from 'ionic-angular';
import { SharedModule } from "../../modules/shared.module";

@NgModule({
  declarations: [ GroupEmployeeTimeLog ],
  imports: [
    CommonModule,
    SharedModule,
    IonicPageModule.forChild(GroupEmployeeTimeLog)
  ],
  exports: [ GroupEmployeeTimeLog ]
})
export class GroupEmployeeTimeLogModule {

}