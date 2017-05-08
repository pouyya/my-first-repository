import { Injectable } from '@angular/core';
import { Service } from '../model/service';
import { BaseEntityService } from  './BaseEntityService';

@Injectable()
export class ServiceService  extends BaseEntityService<Service> {  
    constructor() 
    {
        super(Service);
    }
}