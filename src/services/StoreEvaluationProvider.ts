import { Injectable } from '@angular/core';
import { EvaluationContext } from './EvaluationContext';
import { StoreCriteria } from './../model/StoreCriteria';
import { EvaluationProvider } from './EvaluationProvider'

@Injectable()
export class StoreEvaluationProvider extends EvaluationProvider<StoreCriteria> {

  constructor() {
    super();
  }

  public execute(context: EvaluationContext, criteria: StoreCriteria): Promise<boolean> {
    return Promise.resolve(criteria.storeIds.indexOf(context.currentStore) > -1);
  }

}