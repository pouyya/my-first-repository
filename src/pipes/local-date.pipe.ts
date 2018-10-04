import { DateTimeService } from './../services/dateTimeService';
import { PipeTransform, Pipe } from '@angular/core';

@Pipe({ name: 'localDate', pure: false })
export class LocalDatePipe implements PipeTransform {

  constructor(
    private dateTimeService: DateTimeService) {
  }

  transform(value: any, pattern: string = 'DD/M/YY, h:mm a'): string | null {
    if (value == "----") {
      return "N/A";
    } else if (value) {
      let localDate = this.dateTimeService.getTimezoneDate(value);
      return localDate.format(pattern);
    } else {
      return null;
    }
  }
}