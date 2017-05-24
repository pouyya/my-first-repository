import { BucketItem } from './../model/bucketItem';
import { PurchasableItem } from './../model/purchasableItem';
import { Injectable } from '@angular/core';
import { CategoryService } from './categoryService';
import { CalculatorService } from './calculatorService';
import { TaxService } from './taxService';
import { Sale } from './../model/sale';
import {BaseEntityService} from  './baseEntityService';

@Injectable()
export class SalesServices extends BaseEntityService<Sale> {
	constructor(
		private categoryService: CategoryService,
		private calcService: CalculatorService,
		private taxService: TaxService
	) {
		super(Sale);
	}

	/**
	 * Load Items on sales page by category id
	 * @param id
	 * @returns {any}
	 */
	public loadCategoryItems(id: string) {
		return this.categoryService.getAssociatedItems(id);
	}

	/**
	 * Returns a bucket compatible item
	 * @param item {PurchasableItem}
	 * @return {BucketItem}
	 */
	public prepareBucketItem(item: PurchasableItem): BucketItem {
		let bucketItem = new BucketItem();
		bucketItem._id = item._id;
		item._rev && (bucketItem._rev = item._rev);
		bucketItem.name = item.name;
		bucketItem.actualPrice = typeof item.price != 'number' ?
			parseInt(item.price) : item.price;
		bucketItem.quantity = 1;
		bucketItem.discount = item.discount || 0;
		bucketItem.inStock = item.inStock;
		bucketItem.totalPrice = bucketItem.actualPrice;
		bucketItem.reducedPrice = bucketItem.discount > 0 ? 
			this.calcService.calcItemDiscount(
					bucketItem.discount,
					bucketItem.actualPrice,
					bucketItem.quantity
				) :
			bucketItem.actualPrice;

		return bucketItem;
	}

	/**
	 * Instantiate a default Sale Object
	 * @return {Sale}
	 */
	public instantiateInvoice(id?: string): Promise<any> {
		var tax = this.taxService.getTax() || 0;
		return new Promise((resolve, reject) => {		
			if(id) {
				this.get(id).then(
					doc => {
						doc ? resolve(doc) : resolve(createDefaultObject());
					},
					error => {
						if(error.name == 'not_found') {
							resolve(createDefaultObject());
						} else {
							throw new Error(error);
						}
					}
				);
			} else {
				resolve(createDefaultObject());
			}
		});

		function createDefaultObject() {
			let invoice: Sale = new Sale();
			invoice._id = 'AAD099786746352413F';
			invoice.posID = 'AAD099786746352413F'; // Hardcoded Fixed UUID
			invoice.subTotal = 0;
			invoice.tax = tax;
			invoice.taxTotal = 0;

			return invoice;
		}
	}

	public recalculateOnDiscount(item: BucketItem, invoice: Sale) {
		let discount: number = this.calcService.calcItemDiscount(item.discount, item.actualPrice, item.quantity);
		let result = this.calcService.calcTotalWithTax((invoice.subTotal - item.totalPrice), discount, 'add');
		invoice.subTotal = result.total;
		invoice.taxTotal = result.totalWithTax;
		item.totalPrice = discount;
		item.reducedPrice = item.actualPrice - ((item.discount / 100) * item.actualPrice);
	}

	public sync(invoice: Sale): Promise<any> {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				console.log(invoice);
				this.update(invoice).then(
					() => resolve("Invoice has synced")
				).catch(error => reject(error));
			}, 0);
		});
	}
}