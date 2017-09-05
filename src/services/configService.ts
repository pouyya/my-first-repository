import { Injectable } from '@angular/core';

@Injectable()
export class ConfigService {  
    //TODO: AZ - Need to move values in different file and based on different build type (dev, pre-prod, prod) need to transform config file

    static currentInternalDBName(): string {
        return 'simplepos.db';   
    }

    static externalDBBaseUrl() : string
    {
        return "http://bitnami-couchdb-d399.cloudapp.net:5984";
    }

    static currentExternalDBName(): string
    {
        return '/test_aria';
    }

    static getCurrentFullExternalDBUrl() : string {
        return ConfigService.externalDBBaseUrl() + ConfigService.currentExternalDBName();
    }

    static isDevelopment() :  boolean {
        return true;
    }
}
