import {Injectable} from '@angular/core';
import {Category} from '../model/category';
import {BaseEntityService} from  './baseEntityService';

@Injectable()
export class CategoryService extends BaseEntityService<Category> {
    constructor() {
        super(Category);
    }

    /**
     * Get associated items by category id
     * @param _id
     * @returns {any}
     */
    public getAssociatedItems(_id: string) {
        return this.findBy({
            selector: {
                categoryIDs: {$elemMatch: {$eq: _id}}
            }
        });
    }
}