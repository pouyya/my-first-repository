import { ConfigService } from './../services/configService';
import { AuthHttp, AuthConfig } from 'angular2-jwt';
import { Http } from '@angular/http';
import { Storage } from '@ionic/storage';

let storage = new Storage({});

export function getAuthHttp(http) {
  return new AuthHttp(new AuthConfig({
    headerPrefix: "Bearer",
    noJwtError: true,
    tokenName: ConfigService.securitySessionStorageKey(),
    globalHeaders: [{ 'Accept': 'application/json' }],
    tokenGetter: (() => storage.get(ConfigService.securitySessionStorageKey()).then((token: string) => token)),
  }), http);
}

export let authProvider = {
  provide: AuthHttp,
  useFactory: getAuthHttp,
  deps: [Http]
};