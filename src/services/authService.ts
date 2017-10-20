import { ConfigService } from './configService';
import { UserService } from './userService';
import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { GlobalConstants } from './../metadata/globalConstants';
import { JwtHelper } from 'angular2-jwt';
import 'rxjs/add/operator/map'

// TODO: Remove in future
const MOCK_SETTINGS = {
  defaultIcon: GlobalConstants.DEFAULT_ICON,
  defaultTax: "2017-07-25T10:22:51.163Z",
  taxType: true,
  taxEntity: "SalesTax",
  trackEmployeeSales: true
};

@Injectable()
export class AuthService {

  constructor(
    private http: Http,
    private userService: UserService
  ) { }

  /**
   * Logins the users and creates session
   * @param email 
   * @param password 
   * @returns {Observable<any>}
   */
  public login(email: string, password: string): Observable<any> {

    let payLoad = new URLSearchParams();
    payLoad.append("client_id", ConfigService.securityClientId());
    payLoad.append("client_secret", ConfigService.securityClientSecret());
    payLoad.append("grant_type", ConfigService.securityGrantType());
    payLoad.append("username", email);
    payLoad.append("password", password);
    payLoad.append("scope", ConfigService.securityScope());

    var headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });

    return this.http.post(ConfigService.securityTokenEndPoint(), payLoad.toString(), { headers: headers })
      .flatMap((response: Response) => {
        let jwtHelper: JwtHelper = new JwtHelper();

        let user = response.json();
        let token = jwtHelper.decodeToken(user.access_token);
        let promise = new Promise((resolve, reject) => {
          let userSession: any = {
            ...user,
            ...token,
            settings: MOCK_SETTINGS
          };
          this.userService.setSession(userSession);
          return resolve(userSession);
        });

        return Observable.fromPromise(promise);
      });
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
