export class ConfigService {
    //TODO: AZ - Need to move values in different file and based on different build type (dev, pre-prod, prod) need to transform config file

    static currentInternalDBName(): string {
        return 'simplepos.db';
    }

    static _externalDBUrl: string = "";
    static get externalDBUrl(): string {
        return ConfigService._externalDBUrl;;
    }
    static set externalDBUrl(externalDBBaseUrl: string) {
        ConfigService._externalDBUrl = externalDBBaseUrl;
    }

    static _externalDBName: string = "";
    static get externalDBName(): string {
        return ConfigService._externalDBName;
    }

    static set externalDBName(currentExternalDBName: string) {
        ConfigService._externalDBName = currentExternalDBName;
    }

    static get currentFullExternalDBUrl(): string {
        return ConfigService.externalDBUrl + ConfigService.externalDBName;
    }

    static isDevelopment(): boolean {
        return true;
    }

    static securityTokenEndPoint(): string {
        return 'https://simpleposapp-dev-ids.azurewebsites.net/identity/connect/token';
    }

    static securityClientId(): string {
        return 'simplepos';
    }
    static securityClientSecret(): string {
        return 'secret';
    }

    static securityGrantType(): string {
        return 'password';
    }

    static securityScope(): string {
        return 'simplepos';
    }

    static securitySessionStorageKey(): string {
        return 'jwt-token';
    }
}
