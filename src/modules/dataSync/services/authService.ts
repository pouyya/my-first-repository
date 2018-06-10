import { UserSession } from './../model/UserSession';
import { ConfigService } from './configService';
import { UserService } from './userService';
import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { AuthHttp } from 'angular2-jwt';

import 'rxjs/add/operator/map'
import { icons } from '@simpleidea/simplepos-core/dist/metadata/itemIcons';

@Injectable()
export class AuthService {

  constructor(
    private http: Http,
    private userService: UserService,
    private authHttp: AuthHttp
  ) { }

  /**
   * Logins the users and creates session
   * @param email 
   * @param password 
   * @returns {Observable<any>}
   */
  public login(email: string, password: string): Observable<any> {

    let payLoad = new URLSearchParams();
    payLoad.append("username", email);
    payLoad.append("password", password);

    var headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });

    return this.http.post(ConfigService.securityTokenEndPoint(), payLoad.toString(), { headers: headers })
      .flatMap(async (response: Response) => {
        let user = response.json();
        await this.userService.setAccessToken(user.token)

        return this.getUserProfile(user.token);
      });
  }

  public getUserProfile(token: string) {
    return this.authHttp.get(ConfigService.securityUserInfoEndPoint())
      .flatMap(async (userProfile: Response) => {

        var serverSettings = userProfile.json();
        let userSession: UserSession = new UserSession();
        userSession = {
          access_token: token,
          settings: {
            db_url: serverSettings.dburl,
            db_critical_name: serverSettings.dbcriticalname,
            db_critical_local_name: serverSettings.dbcriticallocalname,
            db_name: serverSettings.dbname,
            db_local_name: serverSettings.dblocalname,
            db_audit_name: serverSettings.dbauditname,
            db_audit_local_name: serverSettings.dbauditlocalname,
          }
        };

        ConfigService.externalDBUrl = userSession.settings.db_url;
        ConfigService.externalDBName = userSession.settings.db_name;
        ConfigService.internalDBName = userSession.settings.db_local_name;

        userSession.settings.defaultIcon = {};
        var firstIconKey = Object.keys(icons)[0];
        userSession.settings.defaultIcon[firstIconKey] = icons[firstIconKey];

        await this.userService.setSession(userSession);

      })
      .toPromise();
  }

  public register(firstName: string, lastName: string, phone: string, email: string, password: string, configPassword: string, shopName: string): Observable<any> {

    let payLoad = new URLSearchParams();
    payLoad.append("FirstName", firstName);
    payLoad.append("LastName", lastName);
    payLoad.append("Phone", phone);
    payLoad.append("Email", email);
    payLoad.append("Password", password);
    payLoad.append("ConfirmPassword", password);
    payLoad.append("ShopName", shopName);

    var headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });

    return this.http.post(ConfigService.registeEndPoint(), payLoad.toString(), { headers: headers });
  }

  /**
   * Resets the password for user email
   * @param email
   * @returns {Observable<any>}
   */
  public resetPassword(email: string): Observable<any> {
    var headers = new Headers({ 'Content-Type': ' application/json', 'Accept': 'application/json, text/plain' });
    return this.http.post(ConfigService.forgotPasswordEndPoint(), JSON.stringify({ "Email": email }), { headers });
  }
}
