import { Injectable } from '@angular/core';

@Injectable()
export class ConfigService {  
    //TODO: AZ - Need to move values in different file and based on different build type (dev, pre-prod, prod) need to transform config file

    static currentInternalDBName(): string {
        return 'SimpleCuts.db';   
    }

    static externalDBBaseUrl() : string
    {
        return "http://simplepos-appserver.azurewebsites.net";
    }

    static currentExternalDBName(): string
    {
        return '/db';
    }

    static getCurrentFullExternalDBUrl() : string {
        return ConfigService.externalDBBaseUrl() + ConfigService.currentExternalDBName();
    }

    static isDevelopment() :  boolean {
        return true;
    }
}
