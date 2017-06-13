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
	public instantiateInvoice(posId: string): Promise<any> {
		var tax = this.taxService.getTax() || 0;
    var id = localStorage.getItem('invoice_id');
    if(!id) {
      localStorage.setItem('invoice_id', new Date().toISOString());
      id = localStorage.getItem('invoice_id');
    }
		return new Promise((resolve, reject) => {		
			if(posId) {
				this.findBy({ "selector": { _id: id, "posID": posId , "state": "current" }, include_docs: true})
				.then(
					docs => {
						if(docs && docs.length > 0)
						{
							var doc = docs[0];
							if(doc)
							{
								resolve(doc);
							}
						}

						return resolve(createDefaultObject(posId));
					},
					error => {
						if(error.name == 'not_found') {
							resolve(createDefaultObject(posId));
						} else {
							throw new Error(error);
						}
					}
				);
			} else {
				resolve(createDefaultObject(posId));
			}
		});

		function createDefaultObject(posID: string) {
			let sale: Sale = new Sale();
			sale._id = new Date().toISOString();
			sale.posID = posID;
			sale.subTotal = 0;
			sale.tax = tax;
			sale.taxTotal = 0;

			return sale;
		}
	}

	public findCompletedByPosId(posId: string) {
		return this.findBy({ selector: { posID: posId, completed: true } })
	}
}