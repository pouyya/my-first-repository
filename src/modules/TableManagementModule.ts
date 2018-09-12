import { Injectable } from '@angular/core';
import { ModuleBase } from "./moduelBase";
import {Sections} from "../pages/section/sections";
import {Tables} from "../pages/table/tables";
import {AddonDashboard} from "../pages/addon-dashboard/addon-dashboard";

@Injectable()
export class TableManagementModule implements ModuleBase {
  public setInjector() {
  }

  public pages = [
    { title: 'Sections', icon: 'home', component: Sections },
    { title: 'Tables', icon: 'home', component: Tables },
    { title: 'Back', icon: 'home', component: AddonDashboard }
  ];

  public pinTheMenu: boolean = true;
}