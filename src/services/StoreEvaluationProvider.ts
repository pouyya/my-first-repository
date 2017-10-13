import { Injectable } from '@angular/core';
import { EvaluationContext } from './EvaluationContext';
import { StoreCriteria } from './../model/StoreCriteria';
import { EvaluationProvider } from './EvaluationProvider'

@Injectable()
export class StoreEvaluationProvider extends EvaluationProvider<StoreCriteria> {

  constructor() {
    super();
  }
  /**
   * @Override
   * @param context 
   * @param criteria 
   * @returns {boolean}
   */
  public execute(context: EvaluationContext, criteria: StoreCriteria): boolean {
    return criteria.storeIds.indexOf(context.currentStore) > -1;
  }

}