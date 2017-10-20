import { Storage } from '@ionic/storage';
import { AuthHttp } from 'angular2-jwt';
import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { User } from './../model/user';
import { BaseEntityService } from './baseEntityService';

@Injectable()
export class UserService extends BaseEntityService<User> {

  public user: any;
  private readonly USER_KEY = 'user';

  constructor(
    private http: Http,
    private authHttp: AuthHttp,
    private storage: Storage
  ) {
    super(User);
  }

  public getById(id: number): Observable<any> {
    return this.authHttp.get('/api/users/' + id).map((response: Response) => response.json());
  }

  public create(user: User): Observable<any> {
    return this.authHttp.post('/api/users', user).map((response: Response) => response.json());
  }

  /**
   * returns singleton instance of user
   * @returns any
   */
  public getLoggedInUser(): any {
    return this.user;
  }

  /**
   * get user from IonicStorage Async
   * @returns {Promise<any>}
   */
  public getUser(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.storage.get(this.USER_KEY)
        .then(user => {
          if (user) {
            this.user = JSON.parse(user);
            resolve(this.user)
          } else {
            resolve(null);
          }
        })
        .catch(error => reject(error));
    });
  }

  public setSession(user: any): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        this.user = user;
        this.storage.set(this.USER_KEY, JSON.stringify(this.user));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  public async getUserToken(): Promise<string> {
    var currentUser = await this.getUser();
    return currentUser.token;
  }

}