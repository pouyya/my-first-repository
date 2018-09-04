import { Injectable } from '@angular/core';
import { ModuleBase } from "./moduelBase";
import { HomePage } from "../pages/home/home";
import { PreferencePosPageLayout } from '../pages/preferences-pos-page-layout/preferences-pos-page-layout';
import { PreferencesStyleFormatPage } from '../pages/preferences-style-format-page/preferences-style-format-page';

@Injectable()
export class PreferencesModule implements ModuleBase {
  public setInjector() {
  }

  public pages = [
    { title: 'Pos Page Layout', icon: 'apps', component: PreferencePosPageLayout },
    { title: 'Style & Format', icon: 'code', component: PreferencesStyleFormatPage },
    { title: 'Back Office', icon: 'build', component: HomePage }
  ];

  public pinTheMenu: boolean = true;
}