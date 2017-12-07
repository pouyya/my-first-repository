import { DateTimeService } from './../services/dateTimeService';
import { PipeTransform, Pipe } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({ name: 'localDate', pure: false })
export class LocalDatePipe extends DatePipe implements PipeTransform {

  constructor(public dateTimeService: DateTimeService) {
    super("");
  }

  transform(value: any, pattern?: string): string | null {
    return super.transform(value, pattern);
  }
}