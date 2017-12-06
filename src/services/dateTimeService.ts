import { Injectable } from '@angular/core';


@Injectable()
export class DateTimeService {

  private _timeZone: number;

  get timezone() {
    return this._timeZone;
  }

  set timezone(value: number) {
    this._timeZone = value;
  }

  public getTimezoneDate(date: string): Date {
    let d = new Date(date);
    return new Date(d.getTime() + (60000 * ((this._timeZone * 60) - d.getTimezoneOffset())));
  }

}