import { PriceBookCriteria } from './../model/PriceBookCriteria';

export abstract class EvaluationProvider<T extends PriceBookCriteria> {
  
  /**
   * execute
   * @param context 
   * @param T 
   * @returns boolean
   */
  public exectue(context: any, T: T): Boolean {
    return true;
  }
}