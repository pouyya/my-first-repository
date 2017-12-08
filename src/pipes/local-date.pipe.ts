import { DateTimeService } from './../services/dateTimeService';
import { PipeTransform, Pipe } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({ name: 'localDate', pure: false })
export class LocalDatePipe implements PipeTransform {

  constructor(
    private datePipe: DatePipe,
    private dateTimeService: DateTimeService) {
  }

  transform(value: any, pattern: string = 'MMM d, y, h:mm:ss a'): string | null {
    let localDate = this.dateTimeService.getTimezoneDate(new Date(value));
    return this.datePipe.transform(localDate, pattern);
  }
}