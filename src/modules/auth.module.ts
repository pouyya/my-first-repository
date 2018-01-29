import { ConfigService } from '../services/configService';
import { AuthHttp, AuthConfig } from 'angular2-jwt';
import { Http } from '@angular/http';
import { Storage } from '@ionic/storage';

export function getAuthHttp(http: Http, storage: Storage) {
  return new AuthHttp(new AuthConfig({
    headerPrefix: "Bearer",
    noJwtError: true,
    globalHeaders: [{ 'Accept': 'application/json' }],
    tokenGetter: (async () => {
      var result =  await storage.get(ConfigService.securitySessionStorageKey());
      return result;
    }),
  }), http);
}

export let authProvider = {
  provide: AuthHttp,
  useFactory: getAuthHttp,
  deps: [Http, Storage]
};