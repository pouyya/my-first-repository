import { Injectable } from '@angular/core';
import { Category } from '../model/category';
import { BaseEntityService } from "@simpleidea/simplepos-core/dist/services/baseEntityService";
import { PurchasableItem } from '../model/purchasableItem';

@Injectable()
export class CategoryService extends BaseEntityService<Category> {
    constructor() {
        super(Category);
    }

    public getPurchasableItems(): Promise<Array<PurchasableItem>> {
        return this.query({
            selector: {
                entityTypeNames: {
                    $elemMatch: { $eq: "PurchasableItem" }
                }
            }
        });
    }
}