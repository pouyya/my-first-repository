import { UserService } from './userService';
import { CacheService } from './cacheService';
import { FountainService } from './fountainService';
import { HelperService } from './helperService';
import _ from 'lodash';
import { BucketItem } from './../model/bucketItem';
import { PurchasableItem } from './../model/purchasableItem';
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
		private cacheService: CacheService
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
	public prepareBucketItem(item: any): BucketItem {
		let inclTax = this._user.settings.taxType;

		let bucketItem = new BucketItem();
		bucketItem._id = item._id;
		item._rev && (bucketItem._rev = item._rev);
		bucketItem.name = item.name;
		bucketItem.tax = item.tax;
		bucketItem.priceBook = item.priceBook;
		bucketItem.actualPrice = item.priceBook.retailPrice;
		bucketItem.quantity = 1;
		bucketItem.discount = item.discount || 0;
		let discountedPrice = bucketItem.discount > 0 ?
			this.calcService.calcItemDiscount(
				bucketItem.discount,
				bucketItem.actualPrice
			) :
			bucketItem.actualPrice;
		bucketItem.finalPrice = inclTax ? this.taxService.calculate(discountedPrice, item.tax.rate) :
			discountedPrice;
		bucketItem.isTaxIncl = inclTax;

		return bucketItem;
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

	public calculateSale(sale: Sale): void {
		if (sale.items.length > 0) {
			sale.subTotal = sale.totalDiscount = 0;
			sale.items.forEach(item => {
				sale.subTotal += (item.finalPrice * item.quantity);
				sale.totalDiscount += ((item.actualPrice - item.finalPrice) * item.quantity);
			});
			sale.taxTotal = this.helperService.round2Dec(this.taxService.calculate(sale.subTotal));
			let roundedTotal = this.helperService.round10(sale.taxTotal, -1);
			sale.round = roundedTotal - sale.taxTotal;
			sale.taxTotal = roundedTotal;
		} else {
			sale.subTotal = 0;
			sale.taxTotal = 0;
			sale.round = 0;
			sale.totalDiscount = 0;
		}
	}
}