import { Injectable } from '@angular/core';
import { Pro } from "@ionic/pro";
import { ENV } from '@app/env';
import { ConfigService } from "../modules/dataSync/services/configService";

const IonicPro = Pro.init(ConfigService.ionicDeployAppId(), {
    appVersion: "0.0.4"
});


@Injectable()
export class ErrorLoggingService {

    public exception (error: Error, extra = []){
        if(ENV.logError){
            Pro.monitoring.exception(error, extra);
        }
    }


    public handleNewError (error){
        if(ENV.logError){
            IonicPro.monitoring.handleNewError(error);
        }
    }

    public log (message: string, extra){
        if(ENV.logError){
            Pro.monitoring.log(message, extra);
        }
    }
}