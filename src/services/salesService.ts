import { Injectable } from '@angular/core';
// import { ProductService } from '../services/productService';
// import { ServiceService } from '../services/serviceService';
import { CategoryService } from './categoryService';

@Injectable()
export class SalesServices {
    constructor(private categoryService: CategoryService) {

    }

    /**
     * Load Category Items
     * @returns {Promise<T>}
     */
    public loadCategoryItems (id: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.categoryService.getAssociatedItems(id).then(
                data => resolve(SalesServices._mergesAssociatedItems(data.products, data.services)),
                error => reject(error)
            );
        });
    }

    private static _mergesAssociatedItems(products: Array<any>, services: Array<any>) {
        return products.concat(services);
    }
}