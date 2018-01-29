import { ENV } from '@app/env'

export class ConfigService {

    static _internalCriticalDBName: string = "";
    static get internalCriticalDBName(): string {
        return this._internalCriticalDBName;
    }
    static set internalCriticalDBName(v: string) {
        this._internalCriticalDBName = v;
    }

    static _externalCriticalDBName: string = "";
    static get externalCriticalDBName(): string {
        return this._externalCriticalDBName;
    }
    static set externalCriticalDBName(v: string) {
        this._externalCriticalDBName = v;
    }

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

    static get currentCriticalFullExternalDBUrl(): string {
        return ConfigService.externalDBUrl + "/" + ConfigService.externalCriticalDBName;
    }

    static isDevelopment(): boolean {
        return !ENV.production;
    }

    static turnOnDeployment(): boolean {
        return ENV.upgrade;
    }

    static securityTokenEndPoint(): string {
        return ConfigService.securityServerBaseUrl() + "/connect/token";
    }

    static securityUserInfoEndPoint(): string {
        return ConfigService.securityServerBaseUrl() + "/connect/userinfo";
    }

    static securityServerBaseUrl(): string {
        return ENV.security.serverBaseUrl;
    }

    static securityClientId(): string {
        return ENV.security.clientId;
    }
    static securityClientSecret(): string {
        return ENV.security.clientSecret;
    }

    static securityGrantType(): string {
        return ENV.security.grantType;
    }

    static securityScope(): string {
        return ENV.security.scope;
    }

    static securitySessionStorageKey(): string {
        return ENV.security.sessionStorageKey;
    }

    static userSessionStorageKey(): string {
        return ENV.security.userSessionStorageKey;
    }

    static ionicDeployAppId(): string {
        return ENV.ionicDeploy.appId;
    }

    static ionicDeployAppChannel(): string {
        return ENV.ionicDeploy.appChannel;
    }
}
