import * as moment from 'moment';
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

  public getTimezoneDateOld(date: string): Date {
    let d = new Date(date);
    return new Date(d.getTime() + (60000 * ((this._timeZone * 60) - d.getTimezoneOffset())));
  }

  public getCurrentUTCDate() {
    return moment.utc();
  }

  public getUTCDate(date: Date | string) {
    return moment.utc(date);
  }

  public getTimezoneDate(date: Date | string) {
    let utc = this.getUTCDate(date);
    return this._timeZone ? utc.utcOffset(this._timeZone) : utc.local();
  }

}