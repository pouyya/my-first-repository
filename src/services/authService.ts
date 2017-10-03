import _ from 'lodash';
import { Store } from './../model/store';
import { POS } from './../model/pos';
import { AppSettings } from './../model/appSettings';
import { StoreService } from './storeService';
import { PosService } from './posService';
import { UserService } from './userService';
import { AppSettingsService } from './appSettingsService';
import { Storage } from '@ionic/storage';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { GlobalConstants } from './../metadata/globalConstants';
import 'rxjs/add/operator/map'

@Injectable()
export class AuthService {

  constructor(
    private http: Http,
    private storage: Storage,
    private appSettingsService: AppSettingsService,
    private posService: PosService,
    private storeService: StoreService,
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
        this.storage.set('jwt-token', user.token);
        let promise = new Promise((resolve, reject) => {
          this.appSettingsService.get().then((settings: AppSettings) => {
            let promises: Promise<any>[] = [
              settings.currentPos ? this.posService.get(settings.currentPos) : this.posService.getFirst(),
              settings.currentStore ? this.storeService.get(settings.currentStore) : this.storeService.getFirst()
            ];

            Promise.all(promises).then((data) => {
              let pos = data[0] as POS;
              let store = data[1] as Store;
              let userSession: any = {
                ...user,
                settings: {
                  ..._.omit(settings, [ 'entityTypeName', 'entityTypeNames', '_rev' ]),
                  defaultIcon: GlobalConstants.DEFAULT_ICON,
                  currentPos: pos._id,
                  currentStore: store._id
                },
                currentPos: { ..._.pick(pos, GlobalConstants.POS_SESSION_PROPS) },
                currentStore: { ..._.pick(store, GlobalConstants.STORE_SESSION_PROPS) }
              };
              this.userService.setSession(userSession);
              return resolve(userSession);
            })
          })
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