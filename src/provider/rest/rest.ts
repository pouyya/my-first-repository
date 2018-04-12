import { Http } from '@angular/http';
import { HttpClient,HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Response } from '@angular/http';




@Injectable()
export class RestProvider {

  constructor(public http: HttpClient) {
    console.log('Hello RestProvider Provider');
  }
    
  apiUrl = 'https://simpleposapp-dev.azurewebsites.net/api/common/';
  apiAction = 'SendEmail';


  public sendEmail(data,token) {
    let URL =this.apiUrl+this.apiAction;

    return  this.http.post(URL, JSON.stringify(data), {
      headers: new HttpHeaders().set('Authorization', token)
      .set('Content-Type', "application/x-www-form-urlencoded")
      .set('Accept', "application/json, text/plain"),
      //params: new HttpParams().set('id', '3'),
    }).catch(this.handleError)
  }

  private handleError (error: Response | any) {
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }
    
    
    
}
