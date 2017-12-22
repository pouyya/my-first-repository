import { StockHistory } from './../model/stockHistory';
import { Injectable } from '@angular/core';
import { BaseEntityService } from './baseEntityService';
import { StoreService } from './storeService';

@Injectable()
export class StockHistoryService extends BaseEntityService<StockHistory> {

  constructor(private storeService: StoreService) {
    super(StockHistory);
  }

  public async getByStoreAndProductId(storeId: string, productId: string): Promise<StockHistory[]> {
    try {
      return await this.findBy({
        selector: { storeId, productId }
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  public async collectProductTotalStockValueForEachStore(productId: string, stores?: string[]) {
    if (stores && stores.length == 0) {
      return Promise.reject([]);
    }

    if (!stores) {
      // then get all stores
      stores = <string[]>(await this.storeService.getAll()).map(store => store._id);
    }

    let collection: any[] = [];
    let promises: any[] = [];
    stores.forEach(store => {
      promises.push(async () => {
        let stocks: StockHistory[] = await this.getByStoreAndProductId(store, productId);
        let value: number = stocks.length > 0 ? stocks.map(stock => stock.value)
          .reduce((a, b) => Number(a) + Number(b)) : 0;
        collection.push({
          storeId: store,
          totalValue: value
        });
        return;
      });
    });

    try {
      await Promise.all(promises.map(promise => promise()));
      return collection;
    } catch (err) {
      return Promise.reject(err);
    }
  }

}