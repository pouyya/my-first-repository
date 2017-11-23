import { Injector } from '@angular/core';
import { EvaluationContext } from './EvaluationContext';
import { Injectable } from '@angular/core';
import { HelperService } from './helperService';
import { PriceBook } from './../model/priceBook';
import { BaseEntityService } from './baseEntityService';
import { PurchasableItemPriceInterface } from "../model/purchasableItemPrice.interface";
import { StoreEvaluationProvider } from './StoreEvaluationProvider';
import { DaysOfWeekEvaluationProvider } from './DaysOfWeekEvaluationProvider';

@Injectable()
export class PriceBookService extends BaseEntityService<PriceBook> {

  public static providerHash: any;

  constructor(
    private helperService: HelperService,
    private injector: Injector
  ) {
    super(PriceBook);
    PriceBookService.providerHash = {
      StoreEvaluationProvider,
      DaysOfWeekEvaluationProvider
    };
  }

  public calculateRetailPriceTaxInclusive(retailPrice: number, tax: number): number {
    return this.helperService.round10(tax != 0 ? ((tax / 100) * retailPrice) + retailPrice : retailPrice, -5);
  }

  public calculateRetailPriceTaxExclusive(retailPriceTaxInclusive: number, tax: number): number {
    return this.helperService.round10(retailPriceTaxInclusive / ((tax / 100) + 1), -5);
  }

  public calculateMarkup(supplyPrice: number, price: number): number {
    return this.helperService.round10((100 * (price - supplyPrice)) / supplyPrice, -5);
  }

  public async getDefault(): Promise<PriceBook> {
    var result = await this.findBy({
      selector: { priority: 0 }
    });

    return (result && result.length > 0) ? result[0] : null;
  }

  /**
   * @Override
   * overrides the BaseEntityService getAll()
   * @returns {Promise<PriceBook[]>}
   */
  public async getAll(): Promise<PriceBook[]> {
    return this.findBy({
      selector: {
        entityTypeNames: {
          $elemMatch: { $eq: "PriceBook" }
        }
      }
    });
  }

  /**
   * get pricebooks above priority 0
   * @returns {Promise<PriceBook[]>}
   */
  public async getExceptDefault(): Promise<PriceBook[]> {
    try {
      return await this.findBy({
        selector: { priority: { $gt: 0 } }
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public async getPriceBookByCriteria() {
    try {
      let data = await this.findBy({
        selector: { priority: { $gte: 0 } }
      });
      return data[0];
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Remove sales tax from price book before deletion
   * @param taxId
   * @returns {Promise<void>}
   */
  public async setPriceBookItemTaxToDefault(taxId: string): Promise<PriceBook> {
    try {
      let priceBooks: PriceBook[] = await this.findBy({
        selector: {
          priority: 0,
          purchasableItems: {
            $elemMatch: {
              salesTaxId: { $eq: taxId }
            }
          }
        }
      });
      if (priceBooks.length > 0) {
        let priceBook: PriceBook = priceBooks[0];
        priceBook.purchasableItems.forEach((item: PurchasableItemPriceInterface) => {
          if (item.salesTaxId == taxId) {
            item.salesTaxId = null; // reset to default
          }
        });

        await this.update(priceBook);
        return priceBook;
      }
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Evaluate a price book on the basis of criteria it holds
   * @param context 
   * @param priceBook
   * @returns {boolean}
   */
  public isEligible(context: EvaluationContext, priceBook: PriceBook): boolean {
    if (priceBook.criteria.length < 1) { return false; }
    let status: boolean[] = [];
    priceBook.criteria.forEach(criteria => {
      let provider: any = this.injector.get(PriceBookService.providerHash[criteria.provider]);
      provider && status.push(provider.execute(context, criteria.criteria));
    });

    return status.every((condition => condition));
  }

}