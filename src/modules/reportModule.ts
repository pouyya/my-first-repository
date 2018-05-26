import { Injectable } from '@angular/core';
import { ModuleBase } from "./moduelBase";
import { ReportsDashboard } from "../pages/report-dashboard/report-dashboard";
import { ReportStockMovementSummaryPage } from "../pages/report-stock-movement-summary/report-stock-movement-summary";
import { HomePage } from "../pages/home/home";

@Injectable()
export class ReportModule implements ModuleBase {
  public setInjector() {
  }

  public pages = [
    { title: 'Dashboard', icon: 'home', component: ReportsDashboard },
    { title: 'Inventory', icon: 'cube', component: ReportStockMovementSummaryPage },
    { title: 'Back Office', icon: 'build', component: HomePage }
  ];    

  public pinTheMenu: boolean = true;
}