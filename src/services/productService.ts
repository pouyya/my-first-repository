import { Injectable, NgZone } from '@angular/core';
import {Product } from '../model/product';
import {BaseEntityService} from  './baseEntityService';

@Injectable()
export class ProductService  extends BaseEntityService<Product> {  
    constructor(private zone : NgZone) 
    {
        super(Product, zone);
    }
}