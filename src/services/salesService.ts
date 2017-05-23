import { Injectable } from '@angular/core';
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

    public prepareBucketItem(item: any) {
        return {
            _id: item._id,
            _rev: item._rev,            
            name: item.name,
            color: item.color,
            image: item.image,
            price: parseInt(item.price),
            categoryIDs: item.categoryIDs,
            e:
            {
               quantity: 1,
               discount: 0,
               discountedPrice: parseInt(item.price),
               quantityPrice: parseInt(item.price)
            }
        }
    }
}