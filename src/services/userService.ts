import { UserSession } from './../model/UserSession';
import { ConfigService } from './configService';
import { Storage } from '@ionic/storage';
import { AuthHttp } from 'angular2-jwt';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

@Injectable()
export class UserService {

  public user: UserSession;

  constructor(
    private http: Http,
    private authHttp: AuthHttp,
    private storage: Storage
  ) { }

  public getLoggedInUser(): UserSession {
    return this.user;
  }

  public async getUser(): Promise<UserSession> {
    var userRawJson = await this.storage.get(ConfigService.userSessionStorageKey())
    this.user = userRawJson ? JSON.parse(userRawJson) : null;
    return this.user;
  }

  public setAccessToken(access_token: string): Promise<any> {
    return this.storage.set(ConfigService.securitySessionStorageKey(), access_token);
  }

  public setSession(user: any): Promise<any> {
    this.user = user;
    return this.storage.set(ConfigService.userSessionStorageKey(), JSON.stringify(this.user));
  }

  public async getUserToken(): Promise<string> {
    var currentUser = await this.getUser();
    return currentUser.access_token;
  }

}