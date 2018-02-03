import { UserSession } from './../model/UserSession';
import { ConfigService } from './configService';
import { UserService } from './userService';
import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { AuthHttp } from 'angular2-jwt';

import 'rxjs/add/operator/map'
import { icons } from '../metadata/itemIcons';

@Injectable()
export class AuthService {

  constructor(
    private http: Http,
    private userService: UserService,
    private authHttp: AuthHttp
  ) { }

  public login(email: string, password: string): Promise<any> {

    let payLoad = new URLSearchParams();
    payLoad.append("client_id", ConfigService.securityClientId());
    payLoad.append("client_secret", ConfigService.securityClientSecret());
    payLoad.append("grant_type", ConfigService.securityGrantType());
    payLoad.append("username", email);
    payLoad.append("password", password);
    payLoad.append("scope", ConfigService.securityScope());

    var headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });

    return this.http.post(ConfigService.securityTokenEndPoint(), payLoad.toString(), { headers: headers })
      .flatMap(async (response: Response) => {
        let user = response.json();
        await this.userService.setAccessToken(user.access_token)

        return this.authHttp.get(ConfigService.securityUserInfoEndPoint())
          .flatMap(async (userProfile: Response) => {

            let userSession: UserSession = new UserSession();
            userSession = {
              acess_token: user.access_token,
              ...user,
              settings: userProfile.json()
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
      }).toPromise();
  }

  public register(firstName: string, lastName: string, phone: string, email: string, password: string, configPassword: string, shopName: string): Promise<any> {

    var payLoad = {
      "FirstName": firstName,
      "LastName": lastName,
      "Phone": phone,
      "Email": email,
      "Password": password,
      "ConfirmPassword": password,
      "ShopName": configPassword
    };

    var headers = new Headers({ 'Content-Type': 'application/application/json' });

    return this.http.post(ConfigService.registeEndPoint(), JSON.stringify(payLoad), { headers: headers })
      .flatMap(async (response: Response) => {
        let user = response.json();
      }).toPromise();
  }

  /**
   * Check if email exists in Server Database
   * @param email 
   * @returns {Observable<any>}
   */
  public checkForValidEmail(email: string): Observable<any> {
    return this.http.post('/api/checkForValidEmail', JSON.stringify({ email }))
  }
}
