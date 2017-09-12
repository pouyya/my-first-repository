import { AuthHttp } from 'angular2-jwt';
import { Observable } from 'rxjs/Rx';
import { NgZone, Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { User } from './../model/user';
import { BaseEntityService } from './baseEntityService';
import { userData } from './../metadata/userMock';
import { tokenNotExpired } from 'angular2-jwt';

@Injectable()
export class UserService extends BaseEntityService<User> {
  constructor(private zone: NgZone, private http: Http, private authHttp: AuthHttp) {
    super(User, zone);
  }

  public getAll(): Observable<any> {
    return this.authHttp.get('/api/users').map((response: Response) => response.json());
  }

  public getById(id: number): Observable<any> {
    return this.authHttp.get('/api/users/' + id).map((response: Response) => response.json());
  }

  public create(user: User): Observable<any> {
    return this.authHttp.post('/api/users', user).map((response: Response) => response.json());
  }

  public isLoggedIn() {
    return tokenNotExpired();
  }

  public getLoggedInUser(): any {
    let user = {};
    user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      user = { ...userData };
      localStorage.setItem('user', JSON.stringify(user));
    }
    return user;
  }

  public getUser() {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch (e) {
      throw new Error(e);
    }
  }

  public persistUser(user) {
    try {
      localStorage.setItem('user', JSON.stringify(user));
    } catch (e) {
      throw new Error(e);
    }
  }
}