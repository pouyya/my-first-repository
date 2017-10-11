import _ from 'lodash';
import { Observable } from "rxjs/Rx";
import { Injectable, NgZone } from '@angular/core';
import { GroupSalesTaxService } from './groupSalesTaxService';
import { SalesTaxService } from './salesTaxService';
import { PriceBook } from './../model/priceBook';
import { PriceBookService } from './priceBookService';
import { UserService } from './userService';
import { CacheService } from './cacheService';
import { FountainService } from './fountainService';
import { HelperService } from './helperService';
import { BucketItem } from './../model/bucketItem';
import { CategoryService } from './categoryService';
import { CalculatorService } from './calculatorService';
import { TaxService } from './taxService';
import { Sale } from './../model/sale';
import { BaseEntityService } from './baseEntityService';

@Injectable()
export class SalesServices extends BaseEntityService<Sale> {

	private _user: any;

	constructor(
		private userService: UserService,
		private categoryService: CategoryService,
		private calcService: CalculatorService,
		private taxService: TaxService,
		private helperService: HelperService,
		private fountainService: FountainService,
		private zone: NgZone,
		private cacheService: CacheService,
		private priceBookService: PriceBookService,
		private salesTaxService: SalesTaxService,
		private groupSalesTaxService: GroupSalesTaxService
	) {
		super(Sale, zone);
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
	 * @return {Promise<Sale>}
	 */
	public instantiateInvoice(posId?: string): Promise<any> {
		let id = localStorage.getItem('invoice_id') || new Date().toISOString();
		if (!posId) posId = this._user.settings.currentPos;
		return new Promise((resolve, reject) => {
			this.findBy({ selector: { _id: id, posID: posId, state: { $in: ['current', 'refund'] } }, include_docs: true })
				.then(
				(invoices: Array<Sale>) => {
					if (invoices && invoices.length > 0) {
						let invoice = invoices[0];
						resolve({
							invoice,
							doRecalculate: invoice.state == 'current'
						});
					} else {
						resolve({
							invoice: createDefaultObject(posId, id),
							doRecalculate: false
						});
					}
				},
				error => {
					if (error.name == 'not_found') {
						resolve({
							invoice: createDefaultObject(posId, id),
							doRecalculate: false
						});
					} else {
						reject(error);
					}
				});
		});

		function createDefaultObject(posID: string, invoiceId: string) {
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
			})
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

	public manageInvoiceId(sale: Sale) {
		let invoiceId = localStorage.getItem('invoice_id');
		if (sale.items.length > 0) {
			invoiceId != sale._id && (localStorage.setItem('invoice_id', sale._id));
		} else {
			localStorage.removeItem('invoice_id');
		}
	}

	public applyDiscountOnSale(value: number, amount: number, tax: number) {
		return {
			asCash: () => {
				let taxAfterDiscount = tax * (1 - (value / amount));
				return {
					tax: taxAfterDiscount,
					subTotal: amount - value - taxAfterDiscount,
					taxTotal: amount - value
				}
			},
			asPercent: () => {
				let discount = this.calcService.calcItemDiscount(value, amount);
				let taxAfterDiscount = tax * (1 - (discount / amount));
				return {
					tax: taxAfterDiscount,
					subTotal: amount - discount - taxAfterDiscount,
					taxTotal: amount - discount
				}				
			}
		};
	}

	public applySurchargeOnSale(value: number, amount: number, tax: number) {
		return {
			asCash: () => {
				let taxAfterDiscount = tax * (1 + (value / amount));
				return<{tax: number, subTotal: number, taxTotal: number}> {
					tax: taxAfterDiscount,
					subTotal: amount + value - taxAfterDiscount,
					taxTotal: amount + value
				}
			},
			asPercent: () => {
				let discount = this.calcService.calcItemDiscount(value, amount);
				let taxAfterDiscount = tax * (1 + (discount / amount));
				return<{tax: number, subTotal: number, taxTotal: number}> {
					tax: taxAfterDiscount,
					subTotal: amount + discount - taxAfterDiscount,
					taxTotal: amount + discount
				}	
			}
		}
	}

	public instantiateRefundSale(originalSale: Sale): Sale {
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
		sale.receiptNo = this.fountainService.getReceiptNumber();
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
			sale.tax = this.helperService.round10(sale.taxTotal - sale.subTotal, -2);
			sale.taxTotal = this.helperService.round10(sale.taxTotal, -2);
			let roundedTotal = this.helperService.round10(sale.taxTotal, -2);
			sale.round = roundedTotal - sale.taxTotal;
			sale.taxTotal = roundedTotal;
		}
	}
}