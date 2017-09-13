import { userData } from './../metadata/userMock';
import { AppSettingsService } from './appSettingsService';
import { Storage } from '@ionic/storage';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'

@Injectable()
export class AuthService {

  constructor(
    private http: Http,
    private storage: Storage,
    private appSettingsService: AppSettingsService
  ) { }

  public login(email: string, password: string): Observable<any> {
    return this.http.post('https://pos.simplecuts.com/api/v1/auth', JSON.stringify({ email, password }))
      .flatMap((response: Response) => {
        let user = response.json();
        let promises: Array<Promise<any>> = [
          this.appSettingsService.getAll()
        ];
        this.storage.set('jwt-token', user.token);
        return Observable.fromPromise(Promise.all(promises).then((data) => {
          let userSession = {
            ...user,
            settings: {
              ...data[0],
              currentStore: userData.settings.currentStore,
              currentPos: userData.settings.currentPos,
              defaultIcon: userData.settings.defaultIcon
            }
          };
          this.storage.set('user', JSON.stringify(userSession));
          return userSession;
        }))
      });
  }

  public checkForValidEmail(email: string): Observable<any> {
    return this.http.post('/api/checkForValidEmail', JSON.stringify({ email }))
  }
}