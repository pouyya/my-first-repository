import _ from 'lodash';
import * as moment from 'moment';
import { StockHistory, Reason } from './../model/stockHistory';
import { Injectable } from '@angular/core';
import { BaseEntityService } from "@simpleidea/simplepos-core/dist/services/baseEntityService";

@Injectable()
export class StockHistoryService extends BaseEntityService<StockHistory> {

  readonly view_stock_per_store = "inventory/stock_per_store";

  constructor() {
    super(StockHistory);
  }

  public async getByStoreAndProductId(storeId: string, productId: string): Promise<StockHistory[]> {
    try {
      return await this.findBy({
        selector: { storeId, productId },
        sort: [{ _id: 'desc' }],
        limit: 50
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  public async getByProductId(productId: string): Promise<StockHistory[]> {
    try {
      return await this.findBy({
        selector: { productId },
        sort: [{ _id: 'desc' }],
        limit: 50
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

  public async getAvailableStock(productIds: string[], storeId) {

    var param = { keys: productIds.map(productId => [productId, storeId]), reduce: true, group: true };

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

  public async getProductsTotalStockValueByStore(productIds: string[], storeId: string): Promise<{ [id: string]: number }> {

    if (productIds.length > 0) {
      let stockPromises: Promise<any>[] = productIds.map(id => this.getByStoreAndProductId(storeId, id));
      let productStocks: any[] = await Promise.all(stockPromises);
      return <{ [id: string]: number }>_.zipObject(productIds, productStocks.map(stocks => {
        let value: number = stocks.length > 0 ? stocks.map(stock => stock.value)
          .reduce((a, b) => Number(a) + Number(b)) : 0;
        return value;
      }));
    }

    return {};
  }

  public static createStockForSale(productId: string, storeId: string, value: number): StockHistory {
    let stock = new StockHistory();
    stock.createdAt = moment().utc().format();
    stock.productId = productId;
    stock.storeId = storeId;
    stock.value = value * -1;
    stock.reason = stock.value <= 0 ? Reason.Purchase : Reason.Return;
    return stock;
  }

  public async getAllStockHistoryByDate(storeId: string, fromDate: Date, toDate: Date): Promise<StockHistory[]> {
    try {
      const query = { createdAt: { $gte: fromDate, $lt: toDate } };
      if (storeId) {
        query['storeId'] = storeId;
      }
      return await this.findBy({
        selector: query,
        sort: [{ _id: 'desc' }]
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }
}