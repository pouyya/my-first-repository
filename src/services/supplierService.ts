import { Injectable } from "@angular/core";
import { BaseEntityService } from "./baseEntityService";
import { Supplier } from "../model/supplier";
import { ProductService } from "./productService";

@Injectable()
export class SupplierService extends BaseEntityService<Supplier> {

	constructor(
		private productService: ProductService
	) {
		super(Supplier);
	}

	public async getWithAssociations(suppliers: any[]) {
		let associations: any[] = [];
		suppliers.forEach((supplier, index, arr) => {
			associations.push(async () => {
				arr[index].associatedProducts = (await this.productService.getAllBySupplier(supplier._id)).length;
				return;
			})
		});
		await Promise.all(associations.map(assoc => assoc()));
		return suppliers;
	}

	public async search(limit: number = 10, skip: number = 0, options?: any) {
		let suppliers: any[] = await super.search(limit, skip, options);
		if(suppliers.length > 0) {
			return await this.getWithAssociations(suppliers);
		}
		return [];
	}

}