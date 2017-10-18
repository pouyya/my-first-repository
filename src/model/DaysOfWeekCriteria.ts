import { Injectable } from '@angular/core';
import { PriceBookCriteria } from './PriceBookCriteria';

@Injectable()
export class DaysOfWeekCriteria extends PriceBookCriteria {

  public days: object;

  constructor() {
    super();
    this.days = {
      mon: false,
      tue: false,
      wed: false,
      thu: false,
      fri: false,
      sat: false,
      sun: false
    };
  }

}