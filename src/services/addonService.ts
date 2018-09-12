import { Injectable } from '@angular/core';
import { BaseEntityService } from "@simplepos/core/dist/services/baseEntityService";
import { Addon } from "../model/addon";

@Injectable()
export class AddonService extends BaseEntityService<Addon> {

  constructor() {
    super(Addon);
  }

  public async isAddonEnabled(type: string){
    let isEnabled = false;
    const addonsData: Addon[] = await this.getAll();
    addonsData.some((addon) => {
        if(addon.addonType === type){
            isEnabled = addon.isEnabled || false;
            return true;
        }
    });
    return isEnabled;
  }
}