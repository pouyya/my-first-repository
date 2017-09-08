import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'

@Injectable()
export class AuthService {

  constructor(private http: Http) { }

  public login(email: string, password: string): Observable<any> {
    return this.http.post('/api/authenticate', JSON.stringify({ email, password }))
      .map((response: Response) => {
        let user = response.json();
        if (user && user.token) {
        let userSession: any = {
          ...user,
          settings: {},
          currentPos: {},
          currentStore: {}
        };
          localStorage.setItem('_user', JSON.stringify(userSession));
        }

        return user;
      });
  }

  public checkForValidEmail(email: string): Observable<any> {
    return this.http.post('/api/checkForValidEmail', JSON.stringify({ email }))
  }
}