import { Pro } from '@ionic/pro';
import { ConfigService } from './../modules/dataSync/services/configService';
import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { IonicErrorHandler } from 'ionic-angular';


const IonicPro = Pro.init(ConfigService.ionicDeployAppId(), {
  appVersion: "0.0.0",
  version: JSON.parse('../../../package.json');
});

@Injectable()
export class AppErrorHandler implements ErrorHandler {
  ionicErrorHandler: IonicErrorHandler;

  constructor(injector: Injector) {
    try {
      this.ionicErrorHandler = injector.get(IonicErrorHandler);
    } catch (e) {
    }
  }

  handleError(err: any): void {
    IonicPro.monitoring.handleNewError(err);
    this.ionicErrorHandler && this.ionicErrorHandler.handleError(err);
  }
}