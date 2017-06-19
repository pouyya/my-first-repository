import { NgZone } from '@angular/core';
import { UserSettings } from './../model/userSettings';
import { Injectable } from '@angular/core';
import { BaseEntityService } from './baseEntityService';

@Injectable()
export class UserSettingsService extends BaseEntityService<UserSettings> {

  constructor(private zone: NgZone) {
    super(UserSettings, zone);
  }

  public getSettings(userId?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!userId) {
        userId = JSON.parse(localStorage.getItem('user'))._id;
      }

      this.findBy({ selector: { userId: userId } })
        .then((userSettings) => resolve(userSettings[0]))
        .catch((error) => reject(error));
    });
  }

}