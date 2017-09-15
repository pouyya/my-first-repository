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

  public login(email: string, password: string): Observable<any> {
    return this.http.post('https://pos.simplecuts.com/api/v1/auth', JSON.stringify({ email, password }))
      .flatMap((response: Response) => {
        let user = response.json();
        this.storage.set('jwt-token', user.token);
        let promise = new Promise((resolve, reject) => {
          this.appSettingsService.get().then((settings: AppSettings) => {
            let promises: Promise<any>[] = [
              this.posService.get(settings.currentPos),
              this.storeService.get(settings.currentStore)
            ];

            Promise.all(promises).then((data) => {
              let pos = data[0] as POS;
              let store = data[1] as Store;
              let userSession: any = {
                ...user,
                settings: {
                  ..._.omit(settings, [ 'entityTypeName', 'entityTypeNames', '_rev' ]),
                  defaultIcon: {
                    name: "icon-barbc-barber-shop-1",
                    type: "svg",
                    noOfPaths: 17
                  }
                },
                currentPos: {
                  _id: pos._id,
                  status: pos.status,
                  name: pos.name
                },
                currentStore: {
                  _id: store._id,
                  name: store.name,
                  saleNumberPrefix: store.saleNumberPrefix,
                  country: store.country
                }
              };
              this.userService.setSession(userSession);
              return resolve(userSession);
            })
          })
        });

        return Observable.fromPromise(promise);
      });
  }

  public checkForValidEmail(email: string): Observable<any> {
    return this.http.post('/api/checkForValidEmail', JSON.stringify({ email }))
  }
}