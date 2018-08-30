import { ModuleBase } from "./moduelBase";
import { HomePage } from "../pages/home/home";
import { Employees } from "../pages/employees/employees";
import { Roster } from "../pages/roster/roster";
import { StaffsTimeLogs } from './../pages/staffs-time-logs/staffs-time-logs';
import {HumanResourceDashboard} from "../pages/human-resource-dashboard/human-resource-dashboard";


export class HumanResourceModule implements ModuleBase {
  public setInjector() {
  }

  public pages = [
    { title: 'Dashboard', icon: 'home', component: HumanResourceDashboard },
    { title: 'Employees', icon: 'contacts', component: Employees },
    { title: 'Roster', icon: 'contacts', component: Roster },
    { title: 'Staffs Time Logs', icon: 'time', component: StaffsTimeLogs },
    { title: 'Back Office', icon: 'build', component: HomePage }
  ];    

  public pinTheMenu: boolean = true;
}