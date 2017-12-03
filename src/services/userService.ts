import { UserSession } from './../model/UserSession';
import { ConfigService } from './configService';
import { Storage } from '@ionic/storage';
import { Injectable } from '@angular/core';
import { AccountSettingService } from './accountSettingService';

@Injectable()
export class UserService {

  constructor(
    private storage: Storage,
    private accountSettingService: AccountSettingService
  ) { }

  public async hasUser(): Promise<boolean> {
    var userRawJson = await this.storage.get(ConfigService.userSessionStorageKey());
    return userRawJson && JSON.parse(userRawJson);
  }

  public async getDeviceUser(): Promise<UserSession> {
    var userRawJson = await this.storage.get(ConfigService.userSessionStorageKey());
    if(userRawJson){
      var user = JSON.parse(userRawJson) as UserSession;
      return user; 
    }

    return null;    
  }

  public async getUser(): Promise<UserSession> {
    var userRawJson = await this.storage.get(ConfigService.userSessionStorageKey());
    if(userRawJson){
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

  public setAccessToken(access_token: string): Promise<any> {
    return this.storage.set(ConfigService.securitySessionStorageKey(), access_token);
  }

  public setSession(user: UserSession): Promise<any> {
    return this.storage.set(ConfigService.userSessionStorageKey(), JSON.stringify(user));
  }

  public async getUserToken(): Promise<string> {
    var currentUser = await this.getUser();
    return currentUser.access_token;
  }

}