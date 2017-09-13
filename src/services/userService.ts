import { Storage } from '@ionic/storage';
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

  public user: any;
  private readonly USER_KEY = 'user';

  constructor(
    private zone: NgZone, 
    private http: Http, 
    private authHttp: AuthHttp,
    private storage: Storage
  ) {
    super(User, zone);
    this._init().catch((error) => {
      throw new Error(error);
    })
  }

  private async _init() {
    try {
      this.user = await this.getUser();
    } catch(error) {
      return Promise.reject(new Error(error));
    }

    return this.user;
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
    user = localStorage.getItem('user');
    if (!user) {
      user = { ...userData };
      localStorage.setItem('user', JSON.stringify(user));
    }
    return user;
  }

  public getUser(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.storage.get(this.USER_KEY)
      .then(user => resolve(JSON.parse(user)))
      .catch(error => reject(error));
    });
  }

  public save(user): void {
    try {
      this.storage.set(this.USER_KEY, JSON.stringify(user));
    } catch(error) {
      throw new Error(error);
    }
  }

  public persistUser(user) {
    try {
      localStorage.setItem('user', JSON.stringify(user));
      this.storage.set('user', JSON.stringify(user));
    } catch (e) {
      throw new Error(e);
    }
  }
}