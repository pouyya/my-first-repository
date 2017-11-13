import { GroupEmployeeTimeLog } from './group-employee-timelog.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicPageModule } from 'ionic-angular';

@NgModule({
  declarations: [ GroupEmployeeTimeLog ],
  imports: [
    CommonModule, 
    IonicPageModule.forChild(GroupEmployeeTimeLog)
  ],
  exports: [ GroupEmployeeTimeLog ]
})
export class GroupEmployeeTimeLogModule {

}