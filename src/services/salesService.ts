import _ from 'lodash';
import * as moment from 'moment';
import { Injectable } from '@angular/core';
import { GroupSalesTaxService } from './groupSalesTaxService';
import { SalesTaxService } from './salesTaxService';
import { UserService } from './../modules/dataSync/services/userService';
import { GlobalConstants } from './../metadata/globalConstants';
import { HelperService } from './helperService';
import { BasketItem } from './../model/basketItem';
import { CalculatorService } from './calculatorService';
import { TaxService } from './taxService';
import { Sale, DiscountSurchargeInterface } from './../model/sale';
import { PurchasableItemPriceInterface } from './../model/purchasableItemPrice.interface';
import { BaseEntityService, SortOptions } from "@simplepos/core/dist/services/baseEntityService";
import { BaseTaxIterface } from '../model/baseTaxIterface';
import { StockHistoryService } from './stockHistoryService';
import { SyncContext } from "./SyncContext";

@Injectable()
export class SalesServices extends BaseEntityService<Sale> {

	public static readonly SALE_DISCOUNT = 'discount';
	public static readonly SALE_SURCHARGE = 'surcharge';

	constructor(
		private userService: UserService,
		private calcService: CalculatorService,
		private taxService: TaxService,
		private helperService: HelperService,
		private salesTaxService: SalesTaxService,
		private groupSalesTaxService: GroupSalesTaxService,
		private stockHistoryService: StockHistoryService,
		private syncContext: SyncContext
	) {
		super(Sale);
	}

	public async instantiateSale(posId?: string): Promise<Sale> {

		if (!posId) {
			posId = this.syncContext.currentPos.id;
		}

		try {
			let id = localStorage.getItem('sale_id');

			if (id) {
				let sales: Sale[] = await this.findBy({ selector: { _id: id, posID: posId, state: { $in: ['current', 'refund'] } }, include_docs: true });
				if (sales && sales.length > 0) {
					let sale = sales[0];
					return sale;
				}
			}

			return SalesServices._createDefaultObject(posId);

		} catch (error) {

			if (error.name === GlobalConstants.NOT_FOUND) {
				return SalesServices._createDefaultObject(posId);
			}

			return Promise.reject(error);
		}
	}

	private static _createDefaultObject(posID: string): Sale {
		let sale = new Sale();
		sale._id = moment().utc().format();
		sale.posID = posID;
		sale.subTotal = 0;
		sale.taxTotal = 0;
		sale.tax = 0;
		return sale;
	}

	public async getSaleTaxs(): Promise<Array<BaseTaxIterface>> {
		let taxes: BaseTaxIterface[] = [];
		var _salesTaxes = await this.salesTaxService.getAll();
		taxes = _salesTaxes.map(salesTax => {
			return { ...salesTax, noOfTaxes: 0 };
		});
		var _groupSalesTaxes = await this.groupSalesTaxService.getAll();
		taxes = taxes.concat(_groupSalesTaxes.map((groupSaleTax => {
			return { ...groupSaleTax, noOfTaxes: groupSaleTax.salesTaxes.length };
		})));

		return taxes;
	}

	public async getDefaultTax(): Promise<any> {
		let service = { "SalesTax": "salesTaxService", "GroupSaleTax": "groupSaleTaxService" };
		var user = await this.userService.getUser();
		return this[service[user.settings.taxEntity]].get(user.settings.defaultTax);
	}

	public findCompletedByPosId(posId: string, posOpeningTime?: string): Promise<any> {
		let selector: any = {
			selector: { posID: posId },
			completed: true
		};
		posOpeningTime && (selector.selector.completedAt = { $gt: posOpeningTime });
		return this.findBy(selector);
	}

	public isSalePresent(): boolean {
		let saleId = localStorage.getItem('sale_id');
		if (saleId) {
			return true;
		}
		return false;
	}

	public async searchSales(posIDs: string[], limit?: number, skip?: number, options?: any, timeFrame?: { startDate: string, endDate: string }, employeeId?: string, paymentType?: string, sort?: SortOptions): Promise<Array<Sale>> {
		let query: any = {
			selector: {
				$and: []
			}
		};

		if (posIDs && posIDs.length > 0) {
			query.selector.$and.posID = { $in: posIDs }
		}

		if (options) {
			_.each(options, (value, key) => {
				if (value != undefined) {
					query.selector.$and.push({ [key]: _.isArray(value) ? { $in: value } : value });
				}
			});
			if (options.hasOwnProperty('completed') && !_.isNull(options.completed)) {
				query.selector.$and.push({ completed: options.completed });
			}
		}

		if (timeFrame) {
			query.selector.$and.push({ created: { $exists: true } });

			if (timeFrame.endDate) {
				query.selector.$and.push({
					created: {
						$lte: timeFrame.endDate
					}
				});
			}

			if (timeFrame.startDate) {
				query.selector.$and.push({
					created: {
						$gte: timeFrame.startDate
					}
				});
			}
		}

		if (employeeId) {
			query.selector.$and.push({
				items: {
					$elemMatch: {
						employeeId: {
							$eq: employeeId
						}
					}
				}
			});
		}

		if (paymentType) {
			query.selector.$and.push({
				payments: {
					$elemMatch: {
						type: {
							$eq: paymentType
						}
					}
				}
			});
		}

		query.sort = [{
			_id: sort || SortOptions.DESC
		}];

		limit && (query.limit = limit);
		skip && (query.skip = skip);

		return await super.findBy(query);
	}

	public async searchSalesOld(posID, limit, offset, options?: any, timeFrame?: { startDate: string, endDate: string }, employeeId?: string, paymentType?: string): Promise<any> {
		let query: any = {
			selector: {
				$and: [
					{ posID }
				]
			}
		};

		if (options) {
			_.each(options, (value, key) => {
				if (value) {
					query.selector.$and.push({ [key]: _.isArray(value) ? { $in: value } : value });
				}
			});
			if (options.hasOwnProperty('completed') && !_.isNull(options.completed)) {
				query.selector.$and.push({ completed: options.completed });
			}
		}

		if (timeFrame) {
			query.selector.$and.push({ created: { $exists: true } });
			query.selector.$and.push({
				created: {
					$lte: timeFrame.endDate
				}
			});
			query.selector.$and.push({
				created: {
					$gte: timeFrame.startDate
				}
			});
		}

		if (employeeId) {
			query.selector.$and.push({
				items: {
					$elemMatch: {
						employeeId: {
							$eq: employeeId
						}
					}
				}
			});
		}

		if (paymentType) {
			query.selector.$and.push({
				payments: {
					$elemMatch: {
						type: {
							$eq: paymentType
						}
					}
				}
			});
		}

		query.sort = [{ _id: 'desc' }];
		let countQuery = _.cloneDeep(query);
		query.limit = limit;
		query.offset = offset;

		var promises: any[] = [
			async () => {
				let data = await this.findBy(countQuery);
				return data.length;
			},
			async () => await this.findBy(query)
		];

		try {
			let [totalCount, docs] = await Promise.all(promises.map(p => p()));
			return { totalCount, docs };
		} catch (err) {
			return Promise.reject(err);
		}
	}

	public async getParkedSalesCount(){
        let query: any = {
            selector: {
                $and: []
            }
        };
        query.selector.$and.push({ posID : this.syncContext.currentPos.id});
        query.selector.$and.push({ state : 'parked'});
		const data = await super.findBy(query);

		return data.length;
	}
	public manageSaleId(sale: Sale) {
		if (sale.items.length > 0 || sale.customerKey) {
			let saleId = localStorage.getItem('sale_id');
			saleId != sale._id && (localStorage.setItem('sale_id', sale._id));
		} else {
			localStorage.removeItem('sale_id');
		}
	}

	public updateEmployeeTiles(employeesList: any[], selectedEmployee: any, updatedEmployee: any, status: string) {
		updatedEmployee.selected = false;
		updatedEmployee.disabled = false;
		if (selectedEmployee && selectedEmployee._id == updatedEmployee._id) {
			selectedEmployee = null;
		}
		let index = _.findIndex(employeesList, { _id: updatedEmployee._id });
		switch (status) {
			case 'clock_in':
				employeesList.push(updatedEmployee);
				break;
			case 'clock_out':
				if (index > -1) {
					employeesList.splice(index, 1);
				}
				break;
			case 'break_start':
				if (index > -1) {
					employeesList[index].selected = false;
					employeesList[index].disabled = true;
				}
				break;
			case 'break_end':
				employeesList[index].selected = false;
				employeesList[index].disabled = false;
				break;
		}
		return;
	}

	public instantiateRefundSale(originalSale: Sale): Sale {
		let sale = new Sale();
		sale._id = moment().utc().format('YYYY-MM-DDTHH:mm:ss.SSSSSSS');
		sale.posID = originalSale.posID;
		sale.originalSalesId = originalSale._id;
		sale.items = originalSale.items.map((item) => {
			item.quantity > 0 && (item.quantity *= -1);
			item.modifierItems && item.modifierItems.forEach(modifierItem => {
				modifierItem.quantity > 0 && (modifierItem.quantity *= -1);
			});
			return item;
		});
		sale.completed = false;
		sale.customerKey = originalSale.customerKey;
		sale.state = 'refund';
		sale.payments = [];
		// set pre values to negative. The inserted ones after that will be positive
		sale.appliedValues = _.map(_.cloneDeep(originalSale.appliedValues), value => {
			value.value *= -1;
			return value;
		});
		sale.saleAppliedValue = originalSale.saleAppliedValue;
		sale.saleAppliedType = originalSale.saleAppliedType;
		this.calculateSale(sale);
		return sale;
	}

	public calculateAndSetBasketPriceAndTax(basketItem: BasketItem, salesTaxes: BaseTaxIterface[], defaultTax: BaseTaxIterface, itemPrice: PurchasableItemPriceInterface, isTaxIncl: boolean): BasketItem {
		basketItem.tax = itemPrice.salesTaxId != null ?
			_.find(salesTaxes, salesTax => salesTax._id == itemPrice.salesTaxId)
			: defaultTax;
		basketItem.priceBook = itemPrice;
		basketItem.systemPrice = isTaxIncl ? itemPrice.inclusivePrice : itemPrice.retailPrice;
		var finalPriceBeforeDiscount = basketItem.manualPrice != null ? basketItem.manualPrice : basketItem.systemPrice;
		basketItem.finalPrice = this.calcService.calcItemDiscount(finalPriceBeforeDiscount, basketItem.discount);
		basketItem.taxAmount = this.taxService.calculateTaxAmount(basketItem.finalPrice, isTaxIncl, basketItem.tax.rate);
		basketItem.isTaxIncl = isTaxIncl;

		return basketItem;
	}

	public async updateStock(sale: Sale, storeId: string) {

		let stockUpdates: Promise<any>[] = [];

		sale.items.forEach(item => {
			if (item) {

				if (item.modifierItems && item.modifierItems.length > 0) {
					item.modifierItems.forEach(modifierItem => {
						if (modifierItem.stockControl) {
							var stockHistory = StockHistoryService.createStockForSale(modifierItem.purchsableItemId, storeId, modifierItem.quantity);
							stockUpdates.push(this.stockHistoryService.add(stockHistory));
						}
					});
				}

				if (item.stockControl) {
					var stockHistory = StockHistoryService.createStockForSale(item.purchsableItemId, storeId, item.quantity);
					stockUpdates.push(this.stockHistoryService.add(stockHistory));
				}
			}
		});

		return Promise.all(stockUpdates);
	}

	public async checkForStockInHand(items: BasketItem[], storeId): Promise<string[]> {
		let stockErrors: string[] = [];

		const productsInStock = await
			this.stockHistoryService.getAvailableStock(items.map(item => item.purchsableItemId), storeId);
		const productsInStockMap = productsInStock.reduce((obj, data) => {
			obj[data.productId] = data.value;
			return obj;
		}, {});
		items.forEach(item => {
			if (!productsInStockMap[item.purchsableItemId] || productsInStockMap[item.purchsableItemId] < item.quantity) {
				stockErrors.push(`${item.name} not enough in stock. Total Stock Available: ${productsInStockMap[item.purchsableItemId] || 0}`);
			}
		});

		return stockErrors;
	}

	public getTaxTotalSaleValue(sale: Sale): number {
		let taxTotal = 0;
		if (sale.items.length > 0) {
			for (let item of sale.items) {
				taxTotal += item.finalPrice * item.quantity;
			}
			/** Rounding Starts */
			taxTotal = this.helperService.round10(taxTotal, -2);
			let roundedTotal = this.helperService.round10(taxTotal, -2);
			taxTotal = roundedTotal;
			/** Rounding Ends */
		}
		return taxTotal;
	}

	public calculateSale(sale: Sale) {
		sale.subTotal = 0;
		sale.taxTotal = 0;
		sale.round = 0;
		sale.totalDiscount = 0;
		sale.tax = 0;
		if (sale.items.length > 0) {
			for (let item of sale.items) {
				sale.tax += item.taxAmount * item.quantity;
				sale.taxTotal += item.finalPrice * item.quantity;
				item.modifierItems && item.modifierItems.forEach(modifierItem => {
					sale.tax += modifierItem.taxAmount * modifierItem.quantity;
					sale.taxTotal += modifierItem.finalPrice * modifierItem.quantity;
				});
			};
			sale.subTotal = sale.taxTotal - sale.tax;

			/** Apply externalValues if any */
			if (sale.appliedValues && sale.appliedValues.length > 0) {
				let result: any = {};
				sale.appliedValues.forEach(value => {
					result = this.applyExternalValues(value, sale);
					result.hasOwnProperty('taxTotal') && (sale.taxTotal = result.taxTotal);
					result.hasOwnProperty('subTotal') && (sale.subTotal = result.subTotal);
					result.hasOwnProperty('tax') && (sale.tax = result.tax);
				});
			}

			/** Rounding Starts */
			sale.tax = this.helperService.round10(sale.tax, -2);
			sale.taxTotal = this.helperService.round10(sale.taxTotal, -2);
			let roundedTotal = this.helperService.round10(sale.taxTotal, -2);
			sale.round = roundedTotal - sale.taxTotal;
			sale.taxTotal = roundedTotal;
			/** Rounding Ends */

		}
	}

	private applyExternalValues(value: DiscountSurchargeInterface, sale: Sale): any {
		let fn: any;
		let typeHash = {
			'cash': 'asCash',
			'percentage': 'asPercent'
		};

		let exec: any = typeHash[value.format];
		if (value.type == SalesServices.SALE_DISCOUNT) {
			fn = this.applyDiscountOnSale(
				value.value, sale.taxTotal, sale.subTotal, sale.tax, sale.state == 'refund'
			);
		} else if (value.type == SalesServices.SALE_SURCHARGE) {
			fn = this.applySurchargeOnSale(
				value.value, sale.taxTotal, sale.subTotal, sale.tax, sale.state == 'refund'
			);
		}

		return fn[exec]();
	}

	private applyDiscountOnSale(value: number, total: number, subtotal: number, tax: number, isRefund: boolean = false) {
		value = Number(value);
		return {
			asCash: () => {
				let taxAfterDiscount = tax * (1 - (value / total));
				return {
					tax: taxAfterDiscount,
					subTotal: total - value - taxAfterDiscount,
					taxTotal: total - value
				}
			},
			asPercent: () => {
				isRefund && (value *= -1);
				let totalDiscount = total - ((value / 100) * total);
				let subTotalDiscount = subtotal - ((value / 100) * subtotal);
				return {
					tax: totalDiscount - subTotalDiscount,
					subTotal: subTotalDiscount,
					taxTotal: totalDiscount
				}
			}
		};
	}

	private applySurchargeOnSale(value: number, total: number, subtotal: number, tax: number, isRefund: boolean = false) {
		value = Number(value);
		return {
			asCash: () => {
				let taxAfterDiscount = tax * (1 + (value / total));
				return {
					tax: taxAfterDiscount,
					subTotal: total + value - taxAfterDiscount,
					taxTotal: total + value
				}
			},
			asPercent: () => {
				isRefund && (value *= -1);
				let totalDiscount = total + ((value / 100) * total);
				let subTotalDiscount = subtotal + ((value / 100) * subtotal);
				return {
					tax: totalDiscount - subTotalDiscount,
					subTotal: subTotalDiscount,
					taxTotal: totalDiscount
				}
			}
		}
	}
}