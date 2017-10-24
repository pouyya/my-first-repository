import _ from 'lodash';
import { Observable } from "rxjs/Rx";
import { Injectable } from '@angular/core';
import { GroupSalesTaxService } from './groupSalesTaxService';
import { SalesTaxService } from './salesTaxService';
import { PriceBook } from './../model/priceBook';
import { PriceBookService } from './priceBookService';
import { UserService } from './userService';
import { CacheService } from './cacheService';
import { GlobalConstants } from './../metadata/globalConstants';
import { Store } from './../model/store';
import { FountainService } from './fountainService';
import { HelperService } from './helperService';
import { BucketItem } from './../model/bucketItem';
import { CategoryService } from './categoryService';
import { CalculatorService } from './calculatorService';
import { TaxService } from './taxService';
import { Sale, DiscountSurchargeInterface } from './../model/sale';
import { PurchasableItem } from './../model/purchasableItem';
import { PurchasableItemPriceInterface } from './../model/purchasableItemPrice.interface';
import { BaseEntityService } from './baseEntityService';
import { EvaluationContext } from './EvaluationContext';

@Injectable()
export class SalesServices extends BaseEntityService<Sale> {

	private _user: any;
	public static readonly SALE_DISCOUNT = 'discount';
	public static readonly SALE_SURCHARGE = 'surcharge';

	constructor(
		private userService: UserService,
		private categoryService: CategoryService,
		private calcService: CalculatorService,
		private taxService: TaxService,
		private helperService: HelperService,
		private fountainService: FountainService,
		private cacheService: CacheService,
		private priceBookService: PriceBookService,
		private salesTaxService: SalesTaxService,
		private groupSalesTaxService: GroupSalesTaxService
	) {
		super(Sale);
		this._user = this.userService.getLoggedInUser();
	}

	/**
	 * Load Items on sales page by category id
	 * @param id
	 * @returns {any}
	 */
	public loadPurchasableItems(id: string) {
		return this.cacheService.getAndPut('sales-cache' + id, key => this.categoryService.getAssociatedItems(id))
	}

	/**
	 * Instantiate a default Sale Object
	 * @param posId (Optional)
	 * @return {Promise<Sale>}
	 */
	public async instantiateInvoice(posId?: string): Promise<any> {
		let id = localStorage.getItem('invoice_id') || new Date().toISOString();
		if (!posId) posId = this._user.currentPos;
		try {
			let invoices: Sale[] = await this.findBy({ selector: { _id: id, posID: posId, state: { $in: ['current', 'refund'] } }, include_docs: true });
			if (invoices && invoices.length > 0) {
				let invoice = invoices[0];
				return { invoice, doRecalculate: invoice.state == 'current' };
			}
			return { invoice: SalesServices._createDefaultObject(posId, id), doRecalculate: false };
		} catch (error) {
			if (error.name === GlobalConstants.NOT_FOUND) {
				return { invoice: SalesServices._createDefaultObject(posId, id), doRecalculate: false };
			}
			return Promise.reject(error);
		}
	}

	public static _createDefaultObject(posID: string, invoiceId: string) {
		let sale: Sale = new Sale();

		// This is piece of code temporary and used for setting dummy customer names for search
		let names = ['Omar Zayak', 'Levi Jaegar', 'Mohammad Rehman', 'Fathom McCulin', 'Rothschild'];
		sale.customerName = names[Math.round(Math.random() * (4 - 0) + 0)];
		sale._id = invoiceId;
		sale.posID = posID;
		sale.subTotal = 0;
		sale.taxTotal = 0;
		sale.tax = 0;
		return sale;
	}

	/**
	 * Calculate Existing Sale
	 * @param sale 
	 * @param priceBook 
	 * @param salesTaxes 
	 * @param defaultTax 
	 */
	public reCalculateInMemoryInvoice(sale: Sale, priceBook: PriceBook, salesTaxes: Array<any>, defaultTax: any): Promise<any> {
		// re-calculate sale
		let taxInclusive = this._user.settings.taxType;
		let service = { "SalesTax": "salesTaxService", "GroupSaleTax": "groupSaleTaxService" };
		return new Promise((resolve, reject) => {
			// get account level tax
			this[service[this._user.settings.taxEntity]].get(this._user.settings.defaultTax)
				.then((defaultTax: any) => {
					sale.items.forEach((item: BucketItem) => {
						item.priceBook = _.find(priceBook.purchasableItems, { id: item._id }) as any;
						item.tax = _.pick(
							item.priceBook.salesTaxId != null ?
								_.find(salesTaxes, { _id: item.priceBook.salesTaxId }) : defaultTax,
							['rate', 'name']);
						item.priceBook.inclusivePrice = this.helperService.round2Cents(this.taxService.calculate(item.priceBook.retailPrice, item.tax.rate));
						item.actualPrice = taxInclusive ? item.priceBook.inclusivePrice : item.priceBook.retailPrice;
						item.finalPrice = item.discount != 0 ?
							this.calcService.calcItemDiscount(
								item.discount,
								item.actualPrice
							) : item.actualPrice;
					});
					this.calculateSale(sale);
					resolve(sale);
				})
				.catch(error => reject(error));
		});
	}

	/**
	 * Returns a bucket compatible item
	 * @param item {PurchasableItem}
	 * @return {BucketItem}
	 */
	public prepareBucketItem(item: any): BucketItem {
		let taxInclusive = this._user.settings.taxType;

		let bucketItem = new BucketItem();
		bucketItem._id = item._id;
		item._rev && (bucketItem._rev = item._rev);
		bucketItem.name = item.name;
		bucketItem.tax = {
			...item.tax
		};
		bucketItem.priceBook = item.priceBook;
		bucketItem.priceBook.inclusivePrice = this.helperService.round2Cents(this.taxService.calculate(item.priceBook.retailPrice, item.tax.rate));
		bucketItem.actualPrice = taxInclusive ? item.priceBook.inclusivePrice : item.priceBook.retailPrice;
		bucketItem.quantity = 1;
		bucketItem.discount = item.discount || 0;
		bucketItem.finalPrice = bucketItem.discount > 0 ?
			this.calcService.calcItemDiscount(
				bucketItem.discount,
				bucketItem.actualPrice
			) :
			bucketItem.actualPrice;
		item.employeeId != null && (bucketItem.employeeId = item.employeeId);
		bucketItem.isTaxIncl = taxInclusive;

		return bucketItem;
	}

	/**
	 * Initialize Sales Page Data
	 * @param sale 
	 * @return {Observable}
	 */
	public initializeSalesData(sale: Sale): Observable<Array<any>> {
		return Observable.forkJoin(
			new Promise((resolve, reject) => {
				if (sale) {
					resolve({
						invoice: sale,
						doRecalculate: false
					});
				} else {
					this.instantiateInvoice()
						.then((data: any) => {
							resolve(data);
						}).catch((error) => reject(error));
				}
			}),

			new Promise((resolve, reject) => {
				let taxes: Array<any> = [];
				this.salesTaxService.getAll().then((_salesTaxes: Array<any>) => {
					taxes = _salesTaxes.map((salesTax => {
						return { ...salesTax, noOfTaxes: 0 };
					}));
					this.groupSalesTaxService.getAll().then((_groupSalesTaxes: Array<any>) => {
						taxes = taxes.concat(_groupSalesTaxes.map((groupSaleTax => {
							return { ...groupSaleTax, noOfTaxes: groupSaleTax.salesTaxes.length };
						})));
						resolve(taxes);
					}).catch(error => reject(error));
				}).catch(error => reject(error));
			}),

			new Promise((resolve, reject) => {
				this.priceBookService.getPriceBookByCriteria()
					.then((priceBook: PriceBook) => resolve(priceBook))
					.catch(error => reject(error));
			}),

			new Promise((resolve, reject) => {
				let service = { "SalesTax": "salesTaxService", "GroupSaleTax": "groupSaleTaxService" };
				this[service[this._user.settings.taxEntity]].get(this._user.settings.defaultTax)
					.then((tax: any) => resolve(tax))
					.catch(error => reject(error));
			}),

			this.priceBookService.getExceptDefault()
		);
	}

	public findCompletedByPosId(posId: string, posOpeningTime?: string): Promise<any> {
		let selector: any = { selector: { posID: posId } };
		posOpeningTime && (selector.selector.completedAt = { $gt: posOpeningTime });
		return this.findBy(selector);
	}

	public findInCompletedByPosId(posId: string) {
		return this.findBy({
			selector: {
				posID: posId,
				completed: false,
				state: 'current'
			}
		})
	}


	public searchSales(posId, limit, offset, options): Promise<any> {
		// TODO: Unless count query is not cleared, I have to retrieve all record and count them
		// Of course this is a bad approach, but to do it with pouchdb is weird
		return new Promise((resolve, reject) => {
			var query: any = {
				selector: { posID: posId }
			};
			_.each(options, (value, key) => {
				if (value) {
					query.selector[key] = _.isArray(value) ? { $in: value } : value;
				}
			});
			options.hasOwnProperty('completed') && (query.selector.completed = options.completed);

			var countQuery = { ...query };
			query.limit = limit;
			query.offset = offset;
			query.sort = [{ _id: 'desc' }];

			var promises: Array<Promise<any>> = [
				new Promise((_resolve, _reject) => {
					this.findBy(countQuery).then((data) => _resolve(data.length));
				}),
				new Promise((_resolve, _reject) => {
					this.findBy(query).then((data) => _resolve(data));
				})
			];

			Promise.all(promises).then((result) => {
				resolve({ totalCount: result[0], docs: result[1] });
			})
		});
	}

	/**
	 * Retrives price of item from pricebook
	 * @param context 
	 * @param priceBooks 
	 * @param defaultBook 
	 * @param item 
	 * @returns {any}
	 */
	public getItemPrice(context: EvaluationContext, priceBooks: PriceBook[], defaultBook: PriceBook, item: PurchasableItem): PurchasableItemPriceInterface {
		let container: any = null;
		for (let index in priceBooks) {
			let itemPrice = _.find(priceBooks[index].purchasableItems, { id: item._id });
			let isEligible = this.priceBookService.isEligible(context, priceBooks[index]);
			if (itemPrice && isEligible) {
				container = itemPrice;
				break;
			}
		}
		return container || _.find(defaultBook.purchasableItems, { id: item._id });
	}

	public manageInvoiceId(sale: Sale) {
		let invoiceId = localStorage.getItem('invoice_id');
		if (sale.items.length > 0) {
			invoiceId != sale._id && (localStorage.setItem('invoice_id', sale._id));
		} else {
			localStorage.removeItem('invoice_id');
		}
	}

	public applyDiscountOnSale(value: number, total: number, subtotal: number, tax: number) {
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
				let totalDiscount = total - ((value / 100) * total);
				let subTotalDiscount = total - ((value / 100) * total);
				return {
					tax: totalDiscount - subTotalDiscount,
					subTotal: subTotalDiscount,
					taxTotal: totalDiscount
				}
			}
		};
	}

	public applySurchargeOnSale(value: number, total: number, subtotal: number, tax: number) {
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
				let totalDiscount = total + ((value / 100) * total);
				let subTotalDiscount = total + ((value / 100) * total);
				return {
					tax: totalDiscount - subTotalDiscount,
					subTotal: subTotalDiscount,
					taxTotal: totalDiscount
				}
			}
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

	public instantiateRefundSale(originalSale: Sale, store: Store): Sale {
		let sale = new Sale();
		sale._id = new Date().toISOString();
		sale.posID = originalSale.posID;
		sale.originalSalesId = originalSale._id;
		sale.items = originalSale.items.map((item) => {
			item.quantity > 0 && (item.quantity *= -1);
			return item;
		});
		sale.completed = false;
		sale.customerName = originalSale.customerName;
		sale.state = 'refund';
		sale.receiptNo = this.fountainService.getReceiptNumber(store);
		sale.payments = [];
		this.calculateSale(sale);
		return sale;
	}

	public calculateSale(sale: Sale) {
		sale.subTotal = 0;
		sale.taxTotal = 0;
		sale.round = 0;
		sale.totalDiscount = 0;
		sale.tax = 0;
		if (sale.items.length > 0) {
			sale.items.forEach((item: BucketItem) => {
				let discountedPrice: number = this.calcService.calcItemDiscount(item.discount, item.priceBook.retailPrice);
				sale.subTotal += discountedPrice * item.quantity;
				discountedPrice = this.calcService.calcItemDiscount(item.discount, item.priceBook.inclusivePrice);
				sale.taxTotal += discountedPrice * item.quantity;
			});
			sale.tax = sale.taxTotal - sale.subTotal;

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

	public applyExternalValues(value: DiscountSurchargeInterface, sale: Sale): any {
		let fn: any;
		let typeHash = {
			'cash': 'asCash',
			'percentage': 'asPercent'
		};

		let exec: any = typeHash[value.format];
		if (value.type == SalesServices.SALE_DISCOUNT) {
			fn = this.applyDiscountOnSale(
				value.value, sale.taxTotal, sale.subTotal, sale.tax
			);
		} else if (value.type == SalesServices.SALE_SURCHARGE) {
			fn = this.applySurchargeOnSale(
				value.value, sale.taxTotal, sale.subTotal, sale.tax
			);
		}

		return fn[exec]();
	}
}