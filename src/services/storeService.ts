import { UserService } from './userService';
import { Injectable, NgZone } from '@angular/core';
import {Store} from '../model/store'
import {BaseEntityService} from './baseEntityService';

@Injectable()
export class StoreService extends BaseEntityService<Store> {
  constructor(private zone : NgZone, private usreService: UserService) {
    super(Store, zone);
  }

  public getCurrentStore(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.usreService.getLoggedInUser().then((user) => {
        this.get(user.currentStore)
          .then(store => resolve(store))
          .catch(error => reject(error));
      })
    });
  }
}