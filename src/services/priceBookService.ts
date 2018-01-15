import firstBy from 'thenby';
import { Injector } from '@angular/core';
import { EvaluationContext } from './EvaluationContext';
import { Injectable } from '@angular/core';
import { HelperService } from './helperService';
import { PriceBook } from './../model/priceBook';
import { BaseEntityService } from './baseEntityService';
import { PurchasableItemPriceInterface } from "../model/purchasableItemPrice.interface";
import { StoreEvaluationProvider } from './StoreEvaluationProvider';
import { DaysOfWeekEvaluationProvider } from './DaysOfWeekEvaluationProvider';
import { EvaluationProviderBase } from './EvaluationProvider';
import * as _ from 'lodash';

@Injectable()
export class PriceBookService extends BaseEntityService<PriceBook> {

  public static MAX_PRIORITY: number = 999999999;
  private static providerHash: any;

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
      selector: { priority: PriceBookService.MAX_PRIORITY }
    });

    return (result && result.length > 0) ? result[0] : null;
  }

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
        priceBook.purchasableItems.forEach((itemPrice: PurchasableItemPriceInterface) => {
          if (itemPrice.salesTaxId == taxId) {
            itemPrice.salesTaxId = null; // reset to default
          }
        });

        await this.update(priceBook);
        return priceBook;
      }
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public async getEligibleItemPrice(context: EvaluationContext, priceBooks: PriceBook[], purchasableItemId: string): Promise<PurchasableItemPriceInterface> {
    for (let priceBook of priceBooks) {
      if (await this.isEligible(context, priceBook)) {
        let itemPrice = _.find(priceBook.purchasableItems, { id: purchasableItemId });
        if (itemPrice) {
          return itemPrice;
        }
      }
    }
  }

  public async getAllSortedByPriority(): Promise<Array<PriceBook>> {
    var priceBooks = await this.getAll();

    priceBooks.sort(
      firstBy("priority").thenBy((book1, book2) => {
        return new Date(book2._id).getTime() - new Date(book1._id).getTime();
      }));

    return priceBooks;
  }

  private async isEligible(context: EvaluationContext, priceBook: PriceBook): Promise<boolean> {
    if (!priceBook.criteria || priceBook.criteria.length < 1) { return true; }

    for (let criteria of priceBook.criteria) {
      let provider: EvaluationProviderBase = this.injector.get(PriceBookService.providerHash[criteria.provider]);
      if (provider && await provider.execute(context, criteria.criteria)) {
        return true;
      }
    }

    return false;
  }

}