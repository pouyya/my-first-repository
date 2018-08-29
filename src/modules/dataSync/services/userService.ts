import { UserSession } from './../model/UserSession';
import { Storage } from '@ionic/storage';
import { Injectable } from '@angular/core';
import { AccountSettingService } from './accountSettingService';

@Injectable()
export class UserService {

  constructor(
    private storage: Storage,
    private accountSettingService: AccountSettingService
  ) { }

  public async getDeviceUser(): Promise<UserSession> {
    var userRawJson = await this.storage.get("usermedihair_aria");
    if (userRawJson) {
      var user = JSON.parse(userRawJson) as UserSession;
      return user;
    }

    return null;
  }

  public async isUserLoggedIn(): Promise<boolean> {
    var userRawJson = await this.storage.get("usermedihair_aria");
    return userRawJson;
  }

  public async getUser(): Promise<UserSession> {
    var userRawJson = await this.storage.get("usermedihair_aria");
    if (userRawJson) {
      var user = JSON.parse(userRawJson) as UserSession;

      var currentAccount = await this.accountSettingService.getCurrentSetting();
      user.settings.taxType = currentAccount.taxType;
      user.settings.screenAwake = currentAccount.screenAwake;
      user.settings.trackEmployeeSales = currentAccount.trackEmployeeSales;
      user.settings.defaultTax = currentAccount.defaultTax;
      user.settings.taxEntity = currentAccount.taxEntity;
      user.settings.defaultIcon = currentAccount.defaultIcon;

      return user;
    }

    return null;
  }

  public setUserEmail(email: string): Promise<any> {
    return this.storage.set("user-email", email);
  }

  public setAccessToken(access_token: string): Promise<any> {
    return this.storage.set("jwt-token", access_token);
  }

  public setSession(user: UserSession): Promise<any> {
    return this.storage.set("usermedihair_aria", JSON.stringify(user));
  }

  public async getUserToken(): Promise<string> {
    var currentUser = await this.getUser();
    return currentUser.access_token;
  }

  public async getUserEmail(): Promise<string> {
    var userEmail = await this.storage.get("user-email");
    if (userEmail) {
        return userEmail;
    }
  }
}