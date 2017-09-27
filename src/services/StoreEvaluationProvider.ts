import { Injectable } from '@angular/core';
import { StoreCriteria } from './../model/StoreCriteria';
import { EvaluationProvider } from './EvaluationProvider'
import { PriceBookCriteria } from './../model/PriceBookCriteria';

@Injectable()
export class StoreEvaluationProvider extends EvaluationProvider {

  private _criteria: StoreCriteria;

  get criteria(): StoreCriteria {
    return this._criteria
  }

  set criteria(storeCriteria: StoreCriteria) {
    this._criteria = storeCriteria;
  }

  constructor(storeCriteria: StoreCriteria) {
    super();
    this.criteria = storeCriteria;
  }

  public execute(context: any, criteria?: PriceBookCriteria) {
    
  }

}