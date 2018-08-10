import { Injectable } from '@angular/core';
import { ModuleBase } from "./moduelBase";
import { ReportsDashboard } from "../pages/report-dashboard/report-dashboard";
import { ReportStockMovementSummaryPage } from "../pages/report-stock-movement-summary/report-stock-movement-summary";
import { HomePage } from "../pages/home/home";
import { ReportStaffAttendancePage } from '../pages/report-staff-attendance/report-staff-attendance';

@Injectable()
export class ReportModule implements ModuleBase {
  public setInjector() {
  }

  public pages = [
    { title: 'Dashboard', icon: 'home', component: ReportsDashboard },
    { title: 'Inventory', icon: 'cube', component: ReportStockMovementSummaryPage },
    { title: 'StaffAttendance', icon: 'people', component: ReportStaffAttendancePage },
    { title: 'Back Office', icon: 'build', component: HomePage }
  ];    

  public pinTheMenu: boolean = true;
}