import { EvaluationContext } from './EvaluationContext';
import { PriceBookCriteria } from './../model/PriceBookCriteria';

export abstract class EvaluationProvider<T extends PriceBookCriteria> {
  
  public abstract execute(context: EvaluationContext, criteria: T): boolean;

}