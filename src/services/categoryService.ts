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

    public getAssociatedItems(_id: string): Promise<any> {
        return new Promise((_resolve, _reject) => {
            var productPromise = new Promise((resolve, reject) => {
                this.productService.findBy({
                    selector: {
                    categoryIDs: {$elemMatch: {$eq: _id}}
                }
                }).then(
                    products => resolve(products),
                    error => reject(error)
                );
            });

            var servicePromise = new Promise((resolve, reject) => {
                this.serviceService.findBy({
                    selector: {
                    categoryIDs: {$elemMatch: {$eq: _id}}
                }
                }).then(
                    services => resolve(services),
                    error => reject(error)
                )
            });

            var promises: Array<any> = [productPromise, servicePromise];
            Promise.all(promises).then(
                items => _resolve({products: items[0], services: items[1]}),
                error => _reject(error)
            )
        });
    }
}