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
      .map((response: Response) => {
        let user = response.json();
        if (user && user.token) {
          this.storage.set('jwt-token', user.token);
          delete user.token;

          let promises: Array<Promise<any>> = [
            this.appSettingsService.findBy({ selector: { userId: user.id } })
          ];

          Promise.all(promises).then((data) => {
            let userSession = {
              ...user,
              settings: data[0]
            };
            this.storage.set('_user', userSession);
          })
        }
        return user;
      });
  }

  public checkForValidEmail(email: string): Observable<any> {
    return this.http.post('/api/checkForValidEmail', JSON.stringify({ email }))
  }
}