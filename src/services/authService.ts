import { ConfigService } from './configService';
import { UserService } from './userService';
import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { AuthHttp } from 'angular2-jwt';
import 'rxjs/add/operator/map'

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
            
            let userSession: any = {
              acess_token: user.access_token,
              ...user,
              settings: userProfile.json()
            };
            await this.userService.setSession(userSession);
    
          })
          .toPromise();
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
