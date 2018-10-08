import * as moment from 'moment-timezone';
import { Injectable } from '@angular/core';
import { SyncContext } from "./SyncContext";

@Injectable()
export class DateTimeService {

  constructor(private syncContext: SyncContext) { }

  public getCurrentUTCDate() {
    return moment.utc();
  }

  public getCurrentLocalDate() {
    return this.getTimezoneDate(moment.utc().toDate());
  }

  public getUTCDate(date: Date | string) {
    return moment.utc(date);
  }

  public getTimezoneDate(date: Date | string) {
    let utc = this.getUTCDate(date);
    return this.syncContext.timezone ? utc.tz(this.syncContext.timezone) : utc.local();
  }
}