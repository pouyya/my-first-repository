import * as moment from 'moment-timezone';
import { Injectable } from '@angular/core';
import { SyncContext } from "./SyncContext";

@Injectable()
export class DateTimeService {

  constructor(private syncContext: SyncContext) { }

  public getUTCDateString(date?: Date | string) {
    return moment.utc(date).format();
  }

  public getLocalDate(date?: Date | string) {
    return this.getTimezoneDate(moment.utc(date).toDate());
  }

  public getLocalDateString(date?: Date | string) {
    return this.getLocalDate(date).format('YYYY-MM-DDTHH:mm:ss.sss');
  }

  public getUTCDate(date?: Date | string) {
    return moment.utc(date);
  }

  public getTimezoneDate(date: Date | string) {
    let utc = this.getUTCDate(date);
    return this.syncContext.timezone ? utc.tz(this.syncContext.timezone) : utc.local();
  }

  public format(date: Date | string, format: string): string {
    return moment(date).format(format);
  }

  public getLocalISOString(date: Date | string): string {
    return this.format(date, 'YYYY-MM-DDTHH:mm:ss.sss');
  }
}