import { ENV } from '@app/env';

export class ConfigService {

    static _internalCriticalDBName: string = '';
    static get internalCriticalDBName(): string {
        return this._internalCriticalDBName;
    }

    static set internalCriticalDBName(v: string) {
        this._internalCriticalDBName = v;
    }

    static _externalCriticalDBName: string = '';
    static get externalCriticalDBName(): string {
        return this._externalCriticalDBName;
    }

    static set externalCriticalDBName(v: string) {
        this._externalCriticalDBName = v;
    }

    static _internalDBName: string = '';
    static get internalDBName(): string {
        return ConfigService._internalDBName;
    }

    static set internalDBName(internalDBName: string) {
        ConfigService._internalDBName = internalDBName;
    }

    static _externalDBUrl: string = '';
    static get externalDBUrl(): string {
        return ConfigService._externalDBUrl;
    }
    static set externalDBUrl(externalDBBaseUrl: string) {
        ConfigService._externalDBUrl = externalDBBaseUrl;
    }

    static _externalDBName: string = '';
    static get externalDBName(): string {
        return ConfigService._externalDBName;
    }

    static set externalDBName(currentExternalDBName: string) {
        ConfigService._externalDBName = currentExternalDBName;
    }

    static _externalAuditDBName: string = '';
    static get externalAuditDBName(): string {
        return this._externalAuditDBName;
    }
    static set externalAuditDBName(v: string) {
        this._externalAuditDBName = v;
    }

    static _internalAuditDBName: string = '';
    static get internalAuditDBName(): string {
        return this._internalAuditDBName;
    }
    static set internalAuditDBName(v: string) {
        this._internalAuditDBName = v;
    }

    static get currentFullExternalDBUrl(): string {
        return ConfigService.externalDBUrl + '/' + ConfigService.externalDBName;
    }

    static get currentCriticalFullExternalDBUrl(): string {
        return ConfigService.externalDBUrl + '/' + ConfigService.externalCriticalDBName;
    }

    static get currentAuditDBUrl(): string {
        return ConfigService.externalDBUrl + '/' + ConfigService.externalAuditDBName;
    }

    static isDevelopment(): boolean {
        return !ENV.production;
    }

    static turnOnDeployment(): boolean {
        return ENV.turnOnDeployment;
    }

    static statusEndPoint(): string {
        return ENV.webapp.baseUrl + "/v1/api/user/status";
    }

    static forgotPasswordEndPoint(): string {
        return ENV.security.serverUrl + '/wp-content/plugins/simplepos-account-management/forget-password.php';
    }

    static salesReportEndPoint(): string {
        return ENV.webapp.baseUrl + ENV.webapp.salesReportUrl;
    }

    static securityUserInfoEndPoint(): string {
        return ConfigService.apiServerBaseUrl() + '/me';
    }

    static mailSenderAPI(): string {
        return ConfigService.apiServerBaseUrl() + '/common/SendEmail';
    }

    static staffAttendanceReport(): string {
        return ENV.webapp.baseUrl + ENV.webapp.staffAttendanceReportUrl;
    }

    static securityServerBaseUrl(): string {
        return ENV.security.serverUrl;
    }

    static securityServerClientId(): string {
        return ENV.security.clientId;
    }

    static securityServerClientSecret(): string {
        return ENV.security.clientSecret;
    }

    static securityServerClientScope(): string {
        return ENV.security.clientScope;
    }

    static apiServerBaseUrl(): string {
        return ENV.security.serverUrl + '/wp-json/wp/v2/users';
    }

    static inventoryReportUrl(): string {
        return ENV.webapp.baseUrl + ENV.webapp.inventoryReportUrl;
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

    static envName(): string {
        return ENV.name;
    }
}
