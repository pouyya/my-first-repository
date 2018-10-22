import { ConfigService } from './configService';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { OAuthService } from 'angular-oauth2-oidc';
import 'rxjs/add/operator/map'
import { AuthConfig } from 'angular-oauth2-oidc';

@Injectable()
export class AuthService {

  oauthDiscovered = false;

  constructor(
    private http: Http,
    private oauthService: OAuthService
  ) { }

  public async login(email: string, password: string) {

    if (!this.oauthDiscovered) {
      const authConfig: AuthConfig = {
        issuer: ConfigService.securityServerBaseUrl(),
        clientId: ConfigService.securityServerClientId(),
        dummyClientSecret: ConfigService.securityServerClientSecret(),
        scope: ConfigService.securityServerClientScope(),
        showDebugInformation: ConfigService.isDevelopment(),
        requireHttps: !ConfigService.isDevelopment(),
        strictDiscoveryDocumentValidation: !ConfigService.isDevelopment(),
        oidc: false
      };
      this.oauthService.configure(authConfig);
      await this.oauthService.loadDiscoveryDocument();
      this.oauthDiscovered = true;
    }

    return this.oauthService.fetchTokenUsingPasswordFlowAndLoadUserProfile(email, password);
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