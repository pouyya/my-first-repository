import { Injectable } from '@angular/core';
import { ModuleBase } from "./moduelBase";
import { ReportsDashboard } from "../pages/report-dashboard/report-dashboard";
import { HomePage } from "../pages/home/home";
import { Employees } from "../pages/employees/employees";
import { Roster } from "../pages/roster/roster";

@Injectable()
export class HumanResourceModule implements ModuleBase {
  public setInjector() {
  }

  public pages = [
    { title: 'Dashboard', icon: 'home', component: ReportsDashboard },
    { title: 'Employees', icon: 'contacts', component: Employees },
    { title: 'Roster', icon: 'contacts', component: Roster },
    { title: 'Back Office', icon: 'build', component: HomePage }
  ];    

  public pinTheMenu: boolean = true;
}