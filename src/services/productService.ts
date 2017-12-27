import _ from 'lodash';
import { Injectable } from '@angular/core';
import { Product } from '../model/product';
import { BaseEntityService } from './baseEntityService';

@Injectable()
export class ProductService extends BaseEntityService<Product> {
	constructor() {
		super(Product);
	}

	public async searchProducts(limit: number = 10, offset: number = 0, options?: any) {
		var query: any = {
			selector: {}
		};
		_.each(options, (value, key) => {
			if (value) {
				query.selector[key] = _.isArray(value) ? { $in: value } : value;
			}
		});
		let countQuery = _.cloneDeep(query);
		query.limit = limit;
		query.offset = offset;

		let promises: any[] = [
			async () => {
				let data = await this.findBy(countQuery);
				return data.length;
			},
			async () => await this.findBy(query)
		];

		try {
			let [totalCount, docs] = await Promise.all(promises.map(p => p()));
			return { totalCount, docs };
		} catch (err) {
			return Promise.reject(err);
		}
	}
	
	public async getAllByBrand(brandId: string) {
		return <Product[]> await this.findBy({
			selector: {
				brandId
			}
		});
	}

}