import {Injectable, Injector} from '@angular/core';
import { ModuleBase } from "./moduelBase";
import { AddonDashboard } from "../pages/addon-dashboard/addon-dashboard";
import {Sections} from "../pages/section/sections";
import {AddonService} from "../services/addonService";
import {HomePage} from "../pages/home/home";

@Injectable()
export class AddonModule implements ModuleBase {
    private addonService: AddonService;

    public setInjector(injector: Injector): void {
        this.addonService = injector.get(AddonService);
        (this.pages[1] as any).isEnabled = this.addonService.isAddonEnabled.bind(this.addonService, 'Table');
    }

  public pages = [
      { title: 'Addons', icon: 'home', component: AddonDashboard },
      { title: 'Table Management', icon: 'home', component: Sections, isAddon: true,
          isEnabled: null },
      { title: 'Back Office', icon: 'build', component: HomePage }
  ];    

  public pinTheMenu: boolean = true;
}