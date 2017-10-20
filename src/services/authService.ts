import { UserService } from './userService';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { GlobalConstants } from './../metadata/globalConstants';
import 'rxjs/add/operator/map'

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
    return this.http.post('https://pos.simplecuts.com/api/v1/auth', JSON.stringify({ email, password }))
      .flatMap((response: Response) => {
        let user = response.json();
        let promise = new Promise((resolve, reject) => {
            let userSession: any = {
              ...user,
              settings: {
                defaultIcon: GlobalConstants.DEFAULT_ICON,
              },
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