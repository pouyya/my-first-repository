import { ConfigService } from './configService';
import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { UserService } from './userService';

@Injectable()
export class EmailService {

  constructor(
    private http: Http,
    private userService: UserService
  ) { }

  public async sendEmail(to: string, subject: string, body: string): Promise<any> {

    let mailOptions = {
      to: to,
      subject: subject,
      body: body,
      attachments: []
    };

    let token = await this.userService.getUserToken();

    var headers = new Headers({ 'Content-Type': 'application/json' });
    headers.set('Authorization', 'Bearer ' + token);
    headers.set('Accept', "application/json, text/plain");

    return this.http.post(ConfigService.mailSenderAPI(), JSON.stringify(mailOptions), { headers: headers })
      .toPromise();
  }

}
