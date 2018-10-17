import { UserSession } from './../model/UserSession';
import { Storage } from '@ionic/storage';
import { Injectable } from '@angular/core';
import { AccountSettingService } from './accountSettingService';
import { icons } from '@simplepos/core/dist/metadata/itemIcons';
import { OAuthService } from 'angular-oauth2-oidc';

@Injectable()
export class UserService {

  constructor(
    private storage: Storage,
    private accountSettingService: AccountSettingService,
    private oauthService: OAuthService
  ) { }

  public async initializeUserProfile() {

    let userSession = new UserSession();
    userSession.settings.defaultIcon = {};
    var firstIconKey = Object.keys(icons)[0];
    userSession.settings.defaultIcon[firstIconKey] = icons[firstIconKey];

    await this.setSession(userSession);
  }

  public async getUserClaims() {
    return this.oauthService.getIdentityClaims();
  }

  public getAccessToken() {
    return this.oauthService.getAccessToken();
  }

  public isUserLoggedIn(): boolean {
    return this.oauthService.hasValidAccessToken();
  }

  public async getUser(locaAccountSetting: boolean = true): Promise<UserSession> {
    var userRawJson = await this.storage.get("simplepos_local_db");
    if (userRawJson) {
      var user = JSON.parse(userRawJson) as UserSession;

      if (locaAccountSetting) {
        var currentAccount = await this.accountSettingService.getCurrentSetting();
        user.settings.taxType = currentAccount.taxType;
        user.settings.screenAwake = currentAccount.screenAwake;
        user.settings.trackEmployeeSales = currentAccount.trackEmployeeSales;
        user.settings.defaultTax = currentAccount.defaultTax;
        user.settings.taxEntity = currentAccount.taxEntity;
        user.settings.defaultIcon = currentAccount.defaultIcon;
      }

      return user;
    }

    return null;
  }

  public setSession(user: UserSession): Promise<any> {
    return this.storage.set("simplepos_local_db", JSON.stringify(user));
  }

  public async getUserEmail(): Promise<string> {
    const claims = this.getUserClaims();

    return claims && claims["email"];
  }
}