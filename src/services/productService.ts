import { Injectable } from '@angular/core';
import { Product } from '../model/product';
import { BaseEntityService } from "@simpleidea/simplepos-core/dist/services/baseEntityService";
import { BasketItem } from "../model/basketItem";
import { Sale } from "../model/sale";

@Injectable()
export class ProductService extends BaseEntityService<Product> {
	constructor() {
		super(Product);
	}

	public async getAllByBrand(brandId: string): Promise<Array<Product>> {
		return this.findBy({
			selector: {
				brandId
			}
		});
	}

	public async getAllBySupplier(supplierId: string): Promise<Array<Product>> {
		return this.findBy({
			selector: {
				supplierId
			}
		});
	}

	public getStockEnabledItems(basketItems: BasketItem[]): BasketItem[] {
		let stockedEnabledItems = this.getAllByStockEnabled(basketItems);
		if (!stockedEnabledItems.length) {
			basketItems.forEach(item => {
				const modifierItemsStockEnabled = this.getAllByStockEnabled(item.modifierItems);
				if (modifierItemsStockEnabled.length) {
					stockedEnabledItems = [...stockedEnabledItems, ...modifierItemsStockEnabled];
				}
			});
		}

		return stockedEnabledItems;
	}

	private getAllByStockEnabled(basketItems: BasketItem[]): BasketItem[] {
		if (!basketItems) {
			return [];
		}
		const stockEnabledItems = basketItems.filter(item => item.stockControl == true);
		return stockEnabledItems;
	}

	public async getByCategoryIds(categoryIds: string[]) {
		return this.findBy({
			selector: {
				_id: { $in: categoryIds }
			}
		});
	}
}