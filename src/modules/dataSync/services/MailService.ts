import { ConfigService } from './configService';
import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'

@Injectable()
export class MailService {

  constructor(
    private http: Http
  ) { }

  /**
   * Logins the users and creates session
   * @param email 
   * @param password 
   * @returns {Observable<any>}
   */
  public sendEmail(mailOptions, token: string): Observable<any> {

    let payLoad = new URLSearchParams();
    payLoad.append("client_id", ConfigService.securityClientId());


    var headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
    headers.set('Authorization', token);
    headers.set('Accept', "application/json, text/plain");

    return this.http.post(ConfigService.mailServer(),JSON.stringify(mailOptions), { headers: headers })
      .flatMap(async (response: Response) => {
        let user = response.json();
        return this
      });
  }

}
