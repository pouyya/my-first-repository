import { EvaluationContext } from './EvaluationContext';
import { PriceBookCriteria } from './../model/PriceBookCriteria';

export abstract class EvaluationProviderBase {
  public abstract execute(context: EvaluationContext, criteria: any): Promise<boolean>;
}


export abstract class EvaluationProvider<T extends PriceBookCriteria> extends EvaluationProviderBase {
  
  public abstract execute(context: EvaluationContext, criteria: T): Promise<boolean>;

}