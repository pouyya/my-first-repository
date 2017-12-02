import { UserSession } from './../model/UserSession';
import { ConfigService } from './configService';
import { Storage } from '@ionic/storage';
import { Injectable } from '@angular/core';

@Injectable()
export class UserService {

  constructor(
    private storage: Storage
  ) { }

  public async getUser(): Promise<UserSession> {
    var userRawJson = await this.storage.get(ConfigService.userSessionStorageKey())
    return userRawJson ? JSON.parse(userRawJson) : null;
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