import { Injectable } from '@angular/core';
import { ModuleBase } from "./moduelBase";
import { Sections } from "../pages/section/sections";
import { Tables } from "../pages/table/tables";
import { AddonDashboard } from "../pages/addon-dashboard/addon-dashboard";

@Injectable()
export class TableManagementModule implements ModuleBase {
  public setInjector() {
  }

  public pages = [
    {
      title: 'Sections', icon: 'map', component: Sections
    },
    { title: 'Tables', icon: 'aperture', component: Tables },
    { title: 'Add-ons', icon: 'infinite', component: AddonDashboard }
  ];

  public pinTheMenu: boolean = true;
}