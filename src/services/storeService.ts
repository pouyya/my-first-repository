import {Injectable} from '@angular/core';
import {Store} from '../model/store'
import {BaseEntityService} from './baseEntityService';

@Injectable()
export class StoreService extends BaseEntityService<Store> {
  constructor() {
    super(Store);
  }

  getEmployees() {

  }
}