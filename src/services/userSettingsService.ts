import { NgZone } from '@angular/core';
import { UserSettings } from './../model/userSettings';
import { Injectable } from '@angular/core';
import { BaseEntityService } from './baseEntityService';

@Injectable()
export class UserSettingsService extends BaseEntityService<UserSettings> {

  constructor(private zone: NgZone) {
    super(UserSettings, zone);
  }
}