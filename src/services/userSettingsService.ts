import { UserService } from './userService';
import { NgZone } from '@angular/core';
import { UserSettings } from './../model/userSettings';
import { Injectable } from '@angular/core';
import { BaseEntityService } from './baseEntityService';

@Injectable()
export class UserSettingsService extends BaseEntityService<UserSettings> {

  constructor(
      private zone: NgZone,
      private userService: UserService
    ) {
    super(UserSettings, zone);
  }

  getCurrentPosID() {
    return this.userService.getLoggedInUser().settings.currentPos;
  }
}