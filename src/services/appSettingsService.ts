import { AppSettings } from './../model/appSettings';
import { Injectable, NgZone } from '@angular/core';
import { BaseEntityService } from './baseEntityService';

@Injectable()
export class AppSettingsService extends BaseEntityService<AppSettings> {

  constructor(
    private zone: NgZone) {
      super(AppSettings, zone);
  }

  public get() {
    return new Promise((resolve, reject) => {
      super.getAll().then((settings: Array<AppSettings>) => {
        resolve(settings[0]);
      }).catch(error => reject(error));
    });
  }

}