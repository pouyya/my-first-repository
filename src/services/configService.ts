export class ConfigService {
    //TODO: AZ - Need to move values in different file and based on different build type (dev, pre-prod, prod) need to transform config file

    static _internalDBName: string = "";
    static get internalDBName(): string {
        return ConfigService._internalDBName;
    }

    static set internalDBName(internalDBName: string) {
        ConfigService._internalDBName = internalDBName;
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
        return ConfigService.externalDBUrl + "/" + ConfigService.externalDBName;
    }

    static isDevelopment(): boolean {
        return true;
    }

    static printerIP() : string {
        return "192.168.1.99";
    }

    static printerPort() : number {
        return 9100;
    }
    
    static securityTokenEndPoint(): string {
        return ConfigService.securityServerBaseUrl() + "/connect/token";
    }

    static securityUserInfoEndPoint(): string {
        return ConfigService.securityServerBaseUrl() + "/connect/userinfo";
    }

    static securityServerBaseUrl(): string {
        return 'https://simpleposapp-dev.azurewebsites.net/identity';
    }

    static securityClientId(): string {
        return 'simplepos';
    }
    static securityClientSecret(): string {
        return '21B5F798-BE55-42BC-8AA8-0025B903DC3B';
    }

    static securityGrantType(): string {
        return 'password';
    }

    static securityScope(): string {
        return 'openid';
    }

    static securitySessionStorageKey(): string {
        return 'jwt-token';
    }

    static userSessionStorageKey(): string {
        return 'usermedihair_aria';
        // return 'user' + ConfigService.internalDBName;
    }
}
