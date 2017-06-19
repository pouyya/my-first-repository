import { UserService } from './userService';
import { Injectable, NgZone } from '@angular/core';
import { Store } from '../model/store'
import { BaseEntityService } from './baseEntityService';

@Injectable()
export class StoreService extends BaseEntityService<Store> {
  constructor(private zone: NgZone, private userService: UserService) {
    super(Store, zone);
  }

  public getCurrentStore(): Promise<any> {
    return this.get(this.userService.getUser().settings.currentStore);
  }
}