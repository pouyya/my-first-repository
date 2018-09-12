import {Injectable, Injector} from '@angular/core';
import { ModuleBase } from "./moduelBase";
import {AddonConfig, AddonDashboard} from "../pages/addon-dashboard/addon-dashboard";
import {Sections} from "../pages/section/sections";
import {ToastController} from "ionic-angular";
import {AccountSettingService} from "./dataSync/services/accountSettingService";
import {AddonService} from "../services/addonService";
import {HomePage} from "../pages/home/home";

@Injectable()
export class AddonModule implements ModuleBase {
    private addonConfig: AddonConfig;

    public setInjector(injector: Injector): void {
        this.addonConfig = injector.get(AddonConfig);
        (this.pages[1] as any).isEnabled = this.addonConfig.isAddonEnabled.bind(this.addonConfig, 'Table');
    }

  public pages = [
      { title: 'Addons', icon: 'home', component: AddonDashboard },
      { title: 'Table Management', icon: 'home', component: Sections, isAddon: true,
          isEnabled: null },
      { title: 'Back Office', icon: 'build', component: HomePage }
  ];    

  public pinTheMenu: boolean = true;
}