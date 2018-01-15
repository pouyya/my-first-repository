import { Injectable } from '@angular/core';
import { EvaluationContext } from './EvaluationContext';
import { EvaluationProvider } from './EvaluationProvider'
import { DaysOfWeekCriteria } from './../model/DaysOfWeekCriteria';

@Injectable()
export class DaysOfWeekEvaluationProvider extends EvaluationProvider<DaysOfWeekCriteria> {

  private static readonly daysOfWeek: string[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

  constructor() {
    super();
  }

  public execute(context: EvaluationContext, criteria: DaysOfWeekCriteria): Promise<boolean> {
    let day = DaysOfWeekEvaluationProvider.daysOfWeek[context.currentDateTime.getDay()];
    return Promise.resolve(day && criteria.days.hasOwnProperty(day) ? criteria.days[day] : false);
  }

}