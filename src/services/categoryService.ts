import { Injectable } from '@angular/core';
import { Category } from '../model/category';
import { Product } from '../model/product';
//import { Service } from '../model/Service';
import { BaseEntityService } from  './BaseEntityService';

// services
 import { ProductService } from './productService';
 import { ServiceService } from './serviceService';

@Injectable()
export class CategoryService extends BaseEntityService<Category> {
    constructor(private productService: ProductService, private serviceService: ServiceService)
    {
        super(Category);
    }

    public getAssociatedItems(_id: string) {

        return this.findBy({
                selector: {
                categoryIDs: {$elemMatch: {$eq: _id}}
            }
        });
    }
}