import { BucketItem } from './../model/bucketItem';
import { PurchasableItem } from './../model/purchasableItem';
import { Injectable, NgZone } from '@angular/core';
import { CategoryService } from './categoryService';
import { CalculatorService } from './calculatorService';
import { TaxService } from './taxService';
import { Sale } from './../model/sale';
import {BaseEntityService} from  './baseEntityService';
import {PosService} from "./posService";

@Injectable()
export class SalesServices extends BaseEntityService<Sale> {
	constructor(
		private categoryService: CategoryService,
		private calcService: CalculatorService,
		private taxService: TaxService,
		private posService: PosService,
		private zone : NgZone
	) {
		super(Sale, zone);
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
		bucketItem.finalPrice = bucketItem.discount > 0 ? 
			this.calcService.calcItemDiscount(
					bucketItem.discount,
					bucketItem.actualPrice
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
		var postID = this.posService.getCurrentPosID();
		return new Promise((resolve, reject) => {		
			if(id) {
				this.get(id).then(
					doc => {
						doc && doc.completed === false ? resolve(doc) : resolve(createDefaultObject(postID));
					},
					error => {
						if(error.name == 'not_found') {
							resolve(createDefaultObject(postID));
						} else {
							throw new Error(error);
						}
					}
				);
			} else {
				resolve(createDefaultObject(postID));
			}
		});


		function createDefaultObject(posID: string) {
			let invoice: Sale = new Sale();
			invoice._id = posID;
			invoice.posID = posID;
			invoice.subTotal = 0;
			invoice.tax = tax;
			invoice.taxTotal = 0;

			return invoice;
		}
	}
}