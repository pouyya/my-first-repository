import { Injectable, NgZone } from '@angular/core';
import { Staff } from './../model/staff';
import { BaseEntityService } from './baseEntityService'

@Injectable()
export class StaffService extends BaseEntityService<Staff> {
    constructor(private zone : NgZone) {
        super(Staff, zone);
    }
}