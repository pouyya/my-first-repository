import {Component, Injectable, NgZone} from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { PageModule } from '../../metadata/pageModule';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';
import { AddonModule } from "../../modules/addonModule";
import { ADDONS } from "../../metadata/addons";
import {AddonService} from "../../services/addonService";
import {Addon} from "../../model/addon";

@SecurityModule(SecurityAccessRightRepo.Addons)
@PageModule(() => AddonModule)
@Component({
  selector: 'addon-dashboard',
  templateUrl: 'addon-dashboard.html',
})
export class AddonDashboard {
  private addons = [];
  private addonsMapping = {};
  constructor(public navCtrl: NavController,
    private addonService: AddonService,
    protected zone: NgZone,
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
    this.addons = ADDONS.map((addon) =>{
      if(this.addonsMapping[addon.code]){
          (addon as any).isEnabled = this.addonsMapping[addon.code].isEnabled || false;
      }else{
          (addon as any).isEnabled = false;
      }
      return addon;
    });

    loader.dismiss();
  }

  private async onChange( addon ){
    const addonData = this.addonsMapping[addon.code];
    if(addonData){
      addonData.isEnabled = addon.isEnabled;
      await this.addonService.update(addonData);
    }else{
      const newAddon = new Addon();
      newAddon.addonType = addon.code;
      newAddon.isEnabled = addon.isEnabled;
      newAddon.createdAt = (new Date).toISOString();
      const newAddonData = await this.addonService.add(newAddon);
      this.addonsMapping[newAddonData.addonType] = newAddonData;
    }
  }
}
