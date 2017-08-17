import { Injectable, NgZone } from '@angular/core';
import { Category } from '../model/category';
import { BaseEntityService } from './baseEntityService';

@Injectable()
export class CategoryService extends BaseEntityService<Category> {
    constructor(private zone: NgZone) {
        super(Category, zone);
    }

    /**
     * Get associated items by category id
     * @param _id
     * @returns {any}
     */
    public getAssociatedItems(_id: string) {
        return new Promise((resolve, reject) => {
            this.getDB().createIndex({
                index: {
                    fields: ["order"]
                }
            }).then(() => {
                this.findBy({
                    selector: {
                        categoryIDs: { $elemMatch: { $eq: _id } },
                        order: { $exists: true }
                    },
                    // sort: ['order']
                    // Error: Cannot sort on field(s) "order" when using the default index Error: Cannot sort on field(s) "order" when using the default index at validateSort 
                }).then(data => resolve(data)).catch(error => reject(error));
            }).catch(error => reject(error));
        });
    }
}