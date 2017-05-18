import { Injectable } from '@angular/core';
// import { ProductService } from '../services/productService';
// import { ServiceService } from '../services/serviceService';
import { CategoryService } from './categoryService';

@Injectable()
export class SalesServices {
    constructor(private categoryService: CategoryService) {

    }

    /**
     * Load Items on sales page by category id
     * @param id
     * @returns {any}
     */
    public loadCategoryItems (id: string)  {
        return this.categoryService.getAssociatedItems(id);
    }
}