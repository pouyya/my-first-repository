import { ENV } from '@app/env';

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

    static _externalAuditDBName: string = "";
    static get externalAuditDBName(): string {
        return this._externalAuditDBName;
    }
    static set externalAuditDBName(v: string) {
        this._externalAuditDBName = v;
    }

    static _internalAuditDBName: string = "";
    static get internalAuditDBName(): string {
        return this._internalAuditDBName;
    }
    static set internalAuditDBName(v: string) {
        this._internalAuditDBName = v;
    }

    static get currentFullExternalDBUrl(): string {
        return ConfigService.externalDBUrl + "/" + ConfigService.externalDBName;
    }

    static get currentCriticalFullExternalDBUrl(): string {
        return ConfigService.externalDBUrl + "/" + ConfigService.externalCriticalDBName;
    }

    static get currentAuditDBUrl(): string {
        return ConfigService.externalDBUrl + "/" + ConfigService.externalAuditDBName;
    }

    static isDevelopment(): boolean {
        return !ENV.production;
    }

    static turnOnDeployment(): boolean {
        return ENV.turnOnDeployment;
    }

    static securityTokenEndPoint(): string {
        return ConfigService.securityServerBaseUrl() + "/token";
    }

    static registeEndPoint(): string {
        return ConfigService.apiServerBaseUrl() + "/common/register";
    }

    static forgotPasswordEndPoint(): string {
        return ConfigService.apiServerBaseUrl() + "/common/ForgotPassword";
    }

    static securityUserInfoEndPoint(): string {
        return ConfigService.apiServerBaseUrl() + "/me";
    }

    static mailSenderAPI(): string {
        return ConfigService.apiServerBaseUrl() + "/common/SendEmail";
    }

    
    static securityServerBaseUrl(): string {
        return ENV.security.serverUrl + "/wp-json/jwt-auth/v1";
    }

    static apiServerBaseUrl(): string {
        return ENV.security.serverUrl + "/wp-json/wp/v2/users";
    }

    static ionicDeployAppId(): string {
        return ENV.ionicDeploy.appId;
    }

    static ionicDeployAppChannel(): string {
        return ENV.ionicDeploy.appChannel;
    }

    static ApseeApiKey(): string {
        return ENV.appSee.apikey;
    }
}
