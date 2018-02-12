import { Injectable } from '@angular/core';
import { Product } from '../model/product';
import { BaseEntityService } from "@simpleidea/simplepos-core/dist/services/baseEntityService";

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
}