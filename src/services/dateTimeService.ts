import * as moment from 'moment-timezone';
import { Injectable } from '@angular/core';

@Injectable()
export class DateTimeService {

  private _timeZone: string;

  get timezone() {
    return this._timeZone;
  }

  set timezone(value: string) {
    this._timeZone = value;
  }

  public getCurrentUTCDate() {
    return moment.utc();
  }

  public getUTCDate(date: Date | string) {
    return moment.utc(date);
  }

  public getTimezoneDate(date: Date | string) {
    let utc = this.getUTCDate(date);
    return this._timeZone ? moment.tz(date, this._timeZone) : utc.local();
  }
}