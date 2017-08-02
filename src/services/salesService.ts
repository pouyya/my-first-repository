import { GroupSalesTaxService } from './groupSalesTaxService';
import { SalesTaxService } from './salesTaxService';
import { PriceBook } from './../model/priceBook';
import { PriceBookService } from './priceBookService';
import { AppSettingsService } from './appSettingsService';
import _ from 'lodash';
import { Observable } from "rxjs/Rx";
import { UserService } from './userService';
import { CacheService } from './cacheService';
import { FountainService } from './fountainService';
import { HelperService } from './helperService';
import { BucketItem } from './../model/bucketItem';
import { Injectable, NgZone } from '@angular/core';
import { CategoryService } from './categoryService';
import { CalculatorService } from './calculatorService';
import { TaxService } from './taxService';
import { Sale } from './../model/sale';
import { BaseEntityService } from './baseEntityService';
import { PosService } from "./posService";

@Injectable()
export class SalesServices extends BaseEntityService<Sale> {

	private _user: any;

	constructor(
		private categoryService: CategoryService,
		private calcService: CalculatorService,
		private taxService: TaxService,
		private posService: PosService,
		private helperService: HelperService,
		private fountainService: FountainService,
		private userService: UserService,
		private zone: NgZone,
		private cacheService: CacheService,
		private appSettingsService: AppSettingsService,
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
	 * Returns a bucket compatible item
	 * @param item {PurchasableItem}
	 * @return {BucketItem}
	 */
	public prepareBucketItem(item: any, tax?: number): BucketItem {
		let taxInclusive = this._user.settings.taxType;

		let bucketItem = new BucketItem();
		bucketItem._id = item._id;
		item._rev && (bucketItem._rev = item._rev);
		bucketItem.name = item.name;
		bucketItem.tax = {
			...item.tax,
			amount: item.priceBook.inclusivePrice - item.priceBook.retailPrice
		};
		bucketItem.priceBook = item.priceBook;
		bucketItem.actualPrice = taxInclusive ? item.priceBook.inclusivePrice : item.priceBook.retailPrice;
		bucketItem.quantity = 1;
		bucketItem.discount = item.discount || 0;
		bucketItem.finalPrice = bucketItem.discount > 0 ?
			this.calcService.calcItemDiscount(
				bucketItem.discount,
				bucketItem.actualPrice
			) :
			bucketItem.actualPrice;
		bucketItem.isTaxIncl = taxInclusive;

		return bucketItem;
	}

	public initializeSalesData(invoiceParam: any): Observable<Array<any>> {
		return Observable.forkJoin(
			new Promise((resolve, reject) => {
				if (invoiceParam) {
					resolve(invoiceParam);
				} else {
					this.instantiateInvoice(this.posService.getCurrentPosID())
						.then((invoice: Sale) => {
							resolve(invoice);
						}).catch((error) => reject(error));
				}
			}),

			new Promise((resolve, reject) => {
				this.appSettingsService.loadSalesAndGroupTaxes()
					.then((salesTaxes: Array<any>) => resolve(salesTaxes))
					.catch(error => reject(error));
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

	/**
	 * Instantiate a default Sale Object
	 * @return {Sale}
	 */
	public instantiateInvoice(posId: string): Promise<any> {
		var tax = this.taxService.getTax() || 0;
		var id = localStorage.getItem('invoice_id') || new Date().toISOString();
		return new Promise((resolve, reject) => {
			if (posId) {
				this.findBy({ selector: { _id: id, posID: posId, state: { $in: ['current', 'refund'] } }, include_docs: true })
					.then(
					docs => {
						if (docs && docs.length > 0) {
							var doc = docs[0];
							if (doc) {
								resolve(doc);
							}
						}

						return resolve(createDefaultObject(posId, id));
					},
					error => {
						if (error.name == 'not_found') {
							resolve(createDefaultObject(posId, id));
						} else {
							throw new Error(error);
						}
					}
					);
			} else {
				resolve(createDefaultObject(posId, id));
			}
		});

		function createDefaultObject(posID: string, invoiceId: string) {
			let sale: Sale = new Sale();

			// This is piece of code temporary and used for setting dummy customer names for search
			let names = ['Omar Zayak', 'Levi Jaegar', 'Mohammad Rehman', 'Fathom McCulin', 'Rothschild'];
			sale.customerName = names[Math.round(Math.random() * (4 - 0) + 0)];

			sale._id = invoiceId;
			sale.posID = posID;
			sale.subTotal = 0;
			sale.tax = tax;
			sale.taxTotal = 0;

			return sale;
		}
	}

	public findCompletedByPosId(posId: string, posOpeningTime?: string): Promise<any> {
		var selector: any = { selector: { posID: posId } };
		posOpeningTime && (selector.selector.completedAt = { $gt: posOpeningTime })
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

	public recordsCount() {
		return new Promise((resolve, reject) => {
			this.getAll(true).then(docs => {
				resolve(docs.docs.length);
			}).catch(error => reject(error));
		});
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

	public manageInvoiceId(invoice: Sale) {
		if (invoice.items.length > 0) {
			let invoiceId = localStorage.getItem('invoice_id');
			invoiceId != invoice._id && (localStorage.setItem('invoice_id', invoice._id));
		} else {
			localStorage.removeItem('invoice_id');
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

	public calculateSale(sale: Sale): any {
		var tax = 0;
		if (sale.items.length > 0) {
			sale.subTotal = sale.totalDiscount = sale.taxTotal = 0;
			sale.items.forEach((item: BucketItem) => {
				let discountedPrice: number = this.calcService.calcItemDiscount(item.discount, item.priceBook.retailPrice);
				sale.subTotal += discountedPrice * item.quantity;
				tax += ((discountedPrice * (item.tax.rate / 100)) * item.quantity);
				discountedPrice = this.calcService.calcItemDiscount(item.discount, item.priceBook.inclusivePrice);
				sale.taxTotal += discountedPrice * item.quantity;
			});
			// _.reduce(sale.items.map((selected) => Number(selected.tax.amount)), (sum, n) => sum + n, 0)
			tax = this.helperService.round2Dec(tax);
			sale.taxTotal = this.helperService.round2Dec(sale.taxTotal);
			let roundedTotal = this.helperService.round10(sale.taxTotal, -1);
			sale.round = roundedTotal - sale.taxTotal;
			sale.taxTotal = roundedTotal;
		} else {
			sale.subTotal = 0;
			sale.taxTotal = 0;
			sale.round = 0;
			sale.totalDiscount = 0;
		}

		return {
			tax
		}
	}
}