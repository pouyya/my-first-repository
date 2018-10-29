import _ from 'lodash';
import { StockHistory, Reason } from './../model/stockHistory';
import { Injectable } from '@angular/core';
import { BaseEntityService } from '@simplepos/core/dist/services/baseEntityService';
import { Response } from '@angular/http';
import { ConfigService } from './../modules/dataSync/services/configService';
import { DateTimeService } from './dateTimeService';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class StockHistoryService extends BaseEntityService<StockHistory> {

	readonly view_stock_per_store = "inventory/stock_per_store";

	constructor(private http: HttpClient,
		private dateTimeService: DateTimeService) {
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

	public createStockForSale(productId: string, storeId: string, value: number): StockHistory {
		let stock = new StockHistory();
		stock.createdAt = this.dateTimeService.getUTCDateString();
		stock.createdAtLocalDate = this.dateTimeService.getLocalDateString();
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

	public async getStockMovement(storeId: string, fromDate: string, toDate: string) {
		return this.http
			.get(ConfigService.inventoryReportUrl() +
				`?fromDate=${fromDate}&toDate=${toDate}&currentStoreId=${storeId}`)
			.map((response: Response) => <StockMovement[]>response.json());
	}
}

export interface StockMovement {
	productName: string;
	startStock: number;
	initialValue: number;
	sold: number;
	newStock: number;
	returned: number;
	transfer: number;
	adjustment: number;
	internalUse: number;
	damaged: number;
	outOfDate: number;
	other: number;
	endStock: number;
}
