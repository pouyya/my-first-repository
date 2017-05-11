import { Injectable } from '@angular/core';
import { Category } from '../model/category';
import { BaseEntityService } from  './BaseEntityService';

@Injectable()
export class CategoryService  extends BaseEntityService<Category> {  
    constructor() 
    {
        super(Category);
    }
}