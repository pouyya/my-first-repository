import { Injectable, NgZone } from '@angular/core';
import { BaseEntityService } from './baseEntityService';
import { GlobalConstants } from "../metadata/globalConstants";
import { AppSettings } from './../model/appSettings';
import { UserService } from "./userService";

@Injectable()
export class AppSettingsService extends BaseEntityService<AppSettings> {

  constructor(
    private zone: NgZone,
    private userService: UserService
  ) {
    super(AppSettings, zone);
  }

  /**
   * Get the first setting for now
   * @returns {Promise<T>}
   */
  public get() {
    return new Promise((resolve, reject) => {
      super.getAll().then((settings: Array<AppSettings>) => {
        resolve(settings[0]);
      }).catch(error => reject(error));
    });
  }

  /**
   * set default tax to no tax
   * @returns {Promise<T>}
   */
  public setDefaultTaxToNoTax(): Promise<any> {
    return new Promise((resolve, reject) => {
      let user = this.userService.getLoggedInUser();
      this.get().then((appSettings: AppSettings) => {
        appSettings.defaultTax = GlobalConstants.NO_TAX_ID;
        appSettings.taxEntity = GlobalConstants.DEFAULT_TAX_ENTITY;
        this.update(appSettings).then(() => {
          user.settings.defaultTax = GlobalConstants.NO_TAX_ID;
          user.settings.taxEntity = GlobalConstants.DEFAULT_TAX_ENTITY;
          this.userService.persistUser(user);
          resolve();
        }).catch(error => reject(error));
      }).catch(error => reject(error));
    });
  }

  public matchFromReservedPins(pin: string) {
    return this.findBy({ selector: { reservedPins: { $elemMatch: { $eq: pin } } } });
  }
}