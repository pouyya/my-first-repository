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
import { BaseEntityService } from "@simpleidea/simplepos-core/dist/services/baseEntityService";
import { BaseTaxIterface } from '../model/baseTaxIterface';
import { StockHistoryService } from './stockHistoryService';
import { StockHistory } from './../model/stockHistory';

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
		private stockHistoryService: StockHistoryService
	) {
		super(Sale);
	}

	public async instantiateSale(posId?: string): Promise<Sale> {
		var user = await this.userService.getUser();
		let id = localStorage.getItem('sale_id') || moment().utc().format();
		if (!posId) posId = user.currentPos;
		try {
			let sales: Sale[] = await this.findBy({ selector: { _id: id, posID: posId, state: { $in: ['current', 'refund'] } }, include_docs: true });
			if (sales && sales.length > 0) {
				let sale = sales[0];
				return sale;
			}
			return SalesServices._createDefaultObject(posId, id);
		} catch (error) {
			if (error.name === GlobalConstants.NOT_FOUND) {
				return SalesServices._createDefaultObject(posId, id);
			}
			return Promise.reject(error);
		}
	}

	private static _createDefaultObject(posID: string, saleId: string) {
		let sale: Sale = new Sale();
		sale._id = saleId;
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

	public async getCurrentSaleIfAny() {
		let saleId = localStorage.getItem('sale_id');
		if (saleId) {
			return await this.get(saleId);
		}
		return Promise.resolve(null);
	}

	public async searchSales(posId, limit, offset, options): Promise<any> {
		var query: any = {
			selector: {
				posID: posId
			}
		};
		_.each(options, (value, key) => {
			if (value) {
				query.selector[key] = _.isArray(value) ? { $in: value } : value;
			}
		});
		if (options.hasOwnProperty('completed') && !_.isNull(options.completed)) {
			query.selector.completed = options.completed
		}

		query.sort = [{ _id: 'desc' }];
		var countQuery = _.cloneDeep(query);
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

	public manageSaleId(sale: Sale) {
		let saleId = localStorage.getItem('sale_id');
		if (sale.items.length > 0 || sale.customerKey) {
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
		let stock: StockHistory;
		let stockUpdates: Promise<any>[] = sale.items.map(item => {
			stock = StockHistoryService.createStockForSale(item.purchsableItemId, storeId, item.quantity);
			return this.stockHistoryService.add(stock);
		});
		await Promise.all(stockUpdates);
		return;
	}

	public async checkForStockInHand(sale: Sale, storeId: string): Promise<string[]> {
		let stockErrors: string[] = [];
		let productsInStock: { [id: string]: number } = {};
		let allProducts = sale.items
			.filter(item => item.stockControl)
			.map(item => item.purchsableItemId);
		if (allProducts.length > 0) {
			productsInStock = await this.stockHistoryService
				.getProductsTotalStockValueByStore(allProducts, storeId);
			if (productsInStock && Object.keys(productsInStock).length > 0) {
				sale.items.forEach(item => {
					if (productsInStock.hasOwnProperty(item.purchsableItemId) && productsInStock[item.purchsableItemId] < item.quantity) {
						stockErrors.push(`${item.name} not enough in stock. Total Stock Available: ${productsInStock[item.purchsableItemId]}`);
					}
				});
			}
		}

		return stockErrors;
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