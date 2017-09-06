import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'

@Injectable()
export class AuthService {

  constructor(private http: Http) { }

  public login(username: string, password: string): Observable<any> {
    return this.http.post('/api/authenticate', JSON.stringify({ email: username, password: password }))
      .map((response: Response) => {
        let user = response.json();
        if (user && user.token) {
          localStorage.setItem('_user', JSON.stringify(user));
        }

        return user;
      });
  }

  public forgotPassword() {

  }
}