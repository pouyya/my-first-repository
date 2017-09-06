import { Observable } from 'rxjs/Rx';
import { NgZone, Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { User } from './../model/user';
import { BaseEntityService } from './baseEntityService';
import { userData } from './../metadata/userMock';

@Injectable()
export class UserService extends BaseEntityService<User> {
  constructor(private zone: NgZone, private http: Http) {
    super(User, zone);
  }

  public getAll(): Observable<any> {
    return this.http.get('/api/users', this.JWT()).map((response: Response) => response.json());
  }

  public getById(id: number): Observable<any> {
    return this.http.get('/api/users/' + id, this.JWT()).map((response: Response) => response.json());
  }

  public create(user: User): Observable<any> {
    return this.http.post('/api/users', user, this.JWT()).map((response: Response) => response.json());
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

  private JWT(): RequestOptions {
    // create authorization header with jwt token
    let _user = JSON.parse(localStorage.getItem('_user'));
    if (_user && _user.token) {
      let headers = new Headers({ 'Authorization': 'Bearer ' + _user.token });
      return new RequestOptions({ headers: headers });
    }
  }
}