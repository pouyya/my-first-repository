import { DateTimeService } from './../services/dateTimeService';
import { PipeTransform, Pipe } from '@angular/core';

@Pipe({ name: 'localDate', pure: false })
export class LocalDatePipe implements PipeTransform {

  constructor(
    private dateTimeService: DateTimeService) {
  }

  transform(value: any, pattern: string = 'M/d/YY, h:mm a'): string | null {
    if (value) {
      let localDate = this.dateTimeService.getTimezoneDate(new Date(value));
      return localDate.format(pattern);
    } else {
      return null;
    }
  }
}