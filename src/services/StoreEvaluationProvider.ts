import { Injectable } from '@angular/core';
import { StoreCriteria } from './../model/StoreCriteria';
import { EvaluationProvider } from './EvaluationProvider'

@Injectable()
export class StoreEvaluationProvider extends EvaluationProvider<StoreCriteria> {

  constructor() {
    super();
  }

}