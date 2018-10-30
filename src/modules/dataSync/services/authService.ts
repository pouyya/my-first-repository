import { ConfigService } from './configService';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { OAuthService, LoginOptions } from 'angular-oauth2-oidc';
import 'rxjs/add/operator/map'
import { AuthConfig } from 'angular-oauth2-oidc';

@Injectable()
export class AuthService {

  oauthDiscovered = false;

  constructor(
    private http: Http,
    private oauthService: OAuthService
  ) { }

  public async createAndSaveNonce(): Promise<string> {

    await this.makeSureDiscovered();

    return this.oauthService.createAndSaveNonce();
  }

  public fetchToken(url: string): any {
    const parsedResponse = {};
    if (url) {
      var urlParameter = url.split('#')[1];
      if (urlParameter) {
        const responseParameters = urlParameter.split('&');
        for (let i = 0; i < responseParameters.length; i++) {
          parsedResponse[responseParameters[i].split('=')[0]] =
            responseParameters[i].split('=')[1];
        }
      }
    }

    return parsedResponse;
  }

  public async initImplicitFlow(additionalState?: string, params?: string | object) {

    await this.makeSureDiscovered();

    this.oauthService.initImplicitFlow(additionalState, params);
  }


  public async loadDiscoveryDocumentAndLogin(options?: LoginOptions): Promise<boolean> {

    await this.makeSureDiscovered();

    return this.oauthService.loadDiscoveryDocumentAndLogin(options);
  }

  public async tryLogin(options?: LoginOptions): Promise<void> {

    await this.makeSureDiscovered();

    return this.oauthService.tryLogin(options);
  }

  public async buildOAuthUrl(state, nonce): Promise<string> {

    await this.makeSureDiscovered();

    return this.oauthService.loginUrl +
      '?client_id=' + this.oauthService.clientId + '&' +
      'redirect_uri=' + this.oauthService.redirectUri + '&' +
      'response_type=id_token%20token&' +
      'scope=' + encodeURI(this.oauthService.scope) + '&' +
      'state=' + state + '&nonce=' + nonce;
  }


  private async makeSureDiscovered() {
    if (!this.oauthDiscovered) {
      const authConfig: AuthConfig = {
        issuer: ConfigService.securityServerBaseUrl(),
        clientId: ConfigService.securityServerClientId(),
        dummyClientSecret: ConfigService.securityServerClientSecret(),
        scope: ConfigService.securityServerClientScope(),
        showDebugInformation: ConfigService.isDevelopment(),
        requireHttps: !ConfigService.isDevelopment(),
        strictDiscoveryDocumentValidation: !ConfigService.isDevelopment(),
        oidc: true
      };
      this.oauthService.configure(authConfig);
      await this.oauthService.loadDiscoveryDocument();
      this.oauthService.redirectUri = 'http://localhost:8100';
      this.oauthDiscovered = true;
    }
  }

  /**
   * Resets the password for user email
   * @param email
   * @returns {Observable<any>}
   */
  public async resetPassword(email: string) {
    let url = ConfigService.forgotPasswordEndPoint();
    return this.http
      .get(`${url}?email=${email}`)
      .map((response: Response) => <ServerResponse[]>response.json());
  }

  public async logout() {
    this.oauthService.logOut(true);
  }
}

export interface ServerResponse {
  msg: string,
  Status: number,
}