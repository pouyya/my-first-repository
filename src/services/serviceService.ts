import { Injectable, NgZone } from '@angular/core';
import { Service } from '../model/service';
import { BaseEntityService } from  './baseEntityService';

@Injectable()
export class ServiceService  extends BaseEntityService<Service> {  
    constructor(private zone : NgZone) 
    {
        super(Service, zone);
    }
}