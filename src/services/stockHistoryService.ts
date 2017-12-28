import { StockHistory } from './../model/stockHistory';
import { Injectable } from '@angular/core';
import { BaseEntityService } from './baseEntityService';

@Injectable()
export class StockHistoryService extends BaseEntityService<StockHistory> {
  
  readonly view_stock_per_store = "inventory/stock_per_store";

  constructor() {
    super(StockHistory);
  }

  public async getByProduct(productId: string): Promise<StockHistory[]> {
    try {
      return await this.findBy({
        selector: { productId }
      });
    } catch (err) {
      return Promise.reject(err);
    }
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

  public async getAllProductsTotalStockValue() {

    var param = { reduce: true, group: true, group_level: 1 };

    var result = await this.getDB().query(this.view_stock_per_store, param);

    return result ? result.rows.map(row => {
      return {
        productId: row.key[0],
        value: row.value
      }
    }) : null;
  }

  public async getProductTotalStockValue(productId: string) {

    var param = { reduce: true, group: true, startkey: [productId], endkey: [productId, {}] };

    var result = await this.getDB().query(this.view_stock_per_store, param);

    return result ? result.rows.map(row => {
      return {
        value: row.value,
        storeId: row.key[1]
      };
    }) : null;
  }
}