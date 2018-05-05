import { Injectable } from '@angular/core';
import { Product } from '../model/product';
import { BaseEntityService } from "@simpleidea/simplepos-core/dist/services/baseEntityService";
import { BasketItem } from "../model/basketItem";

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

		if (!basketItems) {
			return [];
		}

		let stockEnabledItems = basketItems.filter(item => item.stockControl == true);

		basketItems && basketItems.forEach(item => {
			if (item) {
				const modifierItemsStockEnabled = this.getStockEnabledItems(item.modifierItems);
				if (modifierItemsStockEnabled && modifierItemsStockEnabled.length) {
					stockEnabledItems = [...stockEnabledItems, ...modifierItemsStockEnabled];
				}
			}
		});

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