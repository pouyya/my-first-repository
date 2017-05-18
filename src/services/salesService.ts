import { Injectable } from '@angular/core';
// import { ProductService } from '../services/productService';
// import { ServiceService } from '../services/serviceService';
import { CategoryService } from './categoryService';

@Injectable()
export class SalesServices {
    constructor(private categoryService: CategoryService) {

    }

    public loadCategoryItems (id: string)  {
        return this.categoryService.getAssociatedItems(id);
    }
}