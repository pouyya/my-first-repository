import { Component, Injectable, NgZone } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { PageModule } from '../../metadata/pageModule';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';
import { AddonModule } from "../../modules/addonModule";
import { ADDONS } from "../../metadata/addons";
import { AddonService } from "../../services/addonService";
import { AddonsService } from '../../services/addonsService';
import { Addon } from "../../model/addon";
import { AccountSettingService } from '../../modules/dataSync/services/accountSettingService';

@SecurityModule(SecurityAccessRightRepo.Addons)
@PageModule(() => AddonModule)
@Component({
  selector: 'addon-dashboard',
  templateUrl: 'addon-dashboard.html',
})
export class AddonDashboard {
  private addons = [];
  private addonsMapping = {};
  private addontoggleVisibility: boolean = false;
  private myBusinessType: string;

  constructor(public navCtrl: NavController,
    private addonService: AddonService,
    protected zone: NgZone,
    private accountSettingService: AccountSettingService,
    private addonsService: AddonsService,
    private loading: LoadingController
  ) {
  }

  async ionViewDidEnter() {
    let loader = this.loading.create({ content: 'Loading Addons...' });
    await loader.present();
    const addonsData: Addon[] = await this.addonService.getAll();
    this.addonsMapping = addonsData.reduce((initObject, data) => {
      initObject[data.addonType] = data;
      return initObject;
    }, {});
    this.addons = ADDONS.map((addon) => {
      if (this.addonsMapping[addon.code]) {
        (addon as any).isEnabled = this.addonsMapping[addon.code].isEnabled || false;
      } else {
        (addon as any).isEnabled = false;
      }
      return addon;
    });

    await this.setVisibilityFlagByBusinessType();

    loader.dismiss();
  }

  async setVisibilityFlagByBusinessType() {
    await this.getBusinessType();

    let addonsBusiness = ADDONS.map((addon) => {
      return addon.businessType;
    });

    if (addonsBusiness[0].length == 0) {
      this.addontoggleVisibility = true;
    }
    else if (addonsBusiness[0].indexOf(this.myBusinessType) != -1) {
      this.addontoggleVisibility = true;
    }
    else {
      this.addontoggleVisibility = false;
    }
  }

  async getBusinessType() {
    let accountSettings = await this.accountSettingService.getCurrentSetting();
    this.myBusinessType = accountSettings.businessType;
  }

  private async onChange(addon) {
    this.announce(addon.isEnabled);

    const addonData = this.addonsMapping[addon.code];
    if (addonData) {
      addonData.isEnabled = addon.isEnabled;
      await this.addonService.update(addonData);
    } else {
      const newAddon = new Addon();
      newAddon.addonType = addon.code;
      newAddon.isEnabled = addon.isEnabled;
      newAddon.createdAt = (new Date).toISOString();
      const newAddonData = await this.addonService.add(newAddon);
      this.addonsMapping[newAddonData.addonType] = newAddonData;
    }
  }

  public announce(status: boolean) {
    this.addonsService.announceAddonsStatus(status);
  }
}
