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

	public async getAllBySupplier(supplierId: string): Promise<Array<Product>>{
		return this.findBy({
			selector: {
				supplierId
			}
		});
	}

    public getStockEnabledItems(sale: Sale): BasketItem[] {
        let items = this.getAllByStockEnabled(sale.items);
        if(!items.length){
            sale.items.forEach( item => {
                const modifierItemsStockEnabled = item.modifierItems && this.getAllByStockEnabled(item.modifierItems);
                if(modifierItemsStockEnabled.length){
                    items = [...items, ...modifierItemsStockEnabled];
                }
            });
        }
        return items;
    }

	private getAllByStockEnabled(items: BasketItem[]): BasketItem[]{
		const stockEnabledItems = items.filter( item => item.stockControl == true);
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