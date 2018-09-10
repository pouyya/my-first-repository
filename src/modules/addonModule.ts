import { Injectable } from '@angular/core';
import { ModuleBase } from "./moduelBase";
import { AddonDashboard } from "../pages/addon-dashboard/addon-dashboard";

@Injectable()
export class AddonModule implements ModuleBase {
  public setInjector() {
  }

  public pages = [
    { title: 'Addons', icon: 'home', component: AddonDashboard }
  ];    

  public pinTheMenu: boolean = true;
}