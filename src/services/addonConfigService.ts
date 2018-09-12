import {Addon} from "../model/addon";
import {AddonService} from "./addonService";
import {Injectable} from "@angular/core";

@Injectable()
export class AddonConfig {
    constructor(private addonService: AddonService){
    }

    public async isAddonEnabled(type: string){
        let isEnabled = false;
        const addonsData: Addon[] = await this.addonService.getAll();
        addonsData.some((addon) => {
            if(addon.addonType === type){
                isEnabled = addon.isEnabled || false;
                return true;
            }
        });
        return isEnabled;
    }
}