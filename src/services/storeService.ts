import { UserService } from './userService';
import { Injectable, NgZone } from '@angular/core';
import { Store } from '../model/store'
import { BaseEntityService } from './baseEntityService';

@Injectable()
export class StoreService extends BaseEntityService<Store> {
  constructor(private zone: NgZone, private userService: UserService) {
    super(Store, zone);
  }

  public getDefaultTax(): Promise<any> {
    let user = this.userService.getLoggedInUser();
    return this.findBy({
      selector: { _id: user.settings.currentStore },
      fields: [ "defaultSaleTaxId" ]
    });
  }

  public update(store: Store): Promise<any> {
    return new Promise((resolve, reject) => {
      super.update(store).then(() => {
        // presist user
        let user = this.userService.getLoggedInUser();
        if(store._id == user.settings.currentStore) {
          user.currentStore = store;
          user.settings.currentStore = store._id;
          this.userService.persistUser(user);
        } 
        resolve();
      }).catch((error) => {
        reject(error);
      });
    });
  }
}