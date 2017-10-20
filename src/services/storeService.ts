import _ from 'lodash';
import { AppService } from './appService';
import { UserService } from './userService';
import { Injectable } from '@angular/core';
import { Store } from '../model/store'
import { BaseEntityService } from './baseEntityService'
import { GlobalConstants } from './../metadata/globalConstants';

@Injectable()
export class StoreService extends BaseEntityService<Store> {
  constructor(
              private userService: UserService,
              private appService: AppService
              ) {
    super(Store);
  }

  public getDefaultTax(): Promise<any> {
    let user = this.userService.getLoggedInUser();
    return this.findBy({
      selector: { _id: user.settings.currentStore },
      fields: ["defaultSaleTaxId"]
    });
  }

  public update(store: Store): Promise<any> {
    return new Promise((resolve, reject) => {
      super.update(store).then(() => {
        // persist user
        let user = this.userService.getLoggedInUser();
        if (store._id == user.settings.currentStore) {
          user.currentStore = _.pick(store, GlobalConstants.STORE_SESSION_PROPS);
          user.settings.currentStore = store._id;
          this.userService.setSession(user);
        }
        resolve();
      }).catch((error) => {
        reject(error);
      });
    });
  }

  /**
   * Delete Store, with all associations if option turned on
   * @param store
   * @param associated
   * @returns {Promise<any>}
   */
  public delete(store: Store, associated: boolean = false): Promise<any> {
    let user = this.userService.getLoggedInUser();
    if (user.settings.currentStore == store._id) {
      return Promise.reject({
        error: 'DEFAULT_STORE_EXISTS',
        error_msg: 'This is your current store. Please switch to other one before deleting it.'
      });
    } else {
      if (!associated) return super.delete(store);
      return new Promise((resolve, reject) => {
        this.appService.deleteStoreAssociations(store)
          .then(() => super.delete(store).then(() => resolve()).catch(error => reject(error)))
          .catch(error => reject(error));
      });
    }
  }
}