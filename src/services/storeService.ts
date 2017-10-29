import { AppService } from './appService';
import { UserService } from './userService';
import { Injectable } from '@angular/core';
import { Store } from '../model/store'
import { BaseEntityService } from './baseEntityService'

@Injectable()
export class StoreService extends BaseEntityService<Store> {
  constructor(
    private userService: UserService,
    private appService: AppService) {
    super(Store);
  }

  public getDefaultTax(): Promise<any> {
    let user = this.userService.getLoggedInUser();
    return this.findBy({
      selector: { _id: user.currentStore },
      fields: ["defaultSaleTaxId"]
    });
  }

  public async update(store: Store): Promise<any> {
    try {
      await super.update(store);
      let user = this.userService.getLoggedInUser();
      if (store._id == user.currentStore) {
        user.currentStore = store._id;
        this.userService.setSession(user);
      }
      return;
    } catch(err) {
      return Promise.reject(err);
    }
  }

  /**
   * Delete Store, with all associations if option turned on
   * @param store
   * @param associated
   * @returns {Promise<any>}
   */
  public async delete(store: Store, associated: boolean = false): Promise<any> {
    let user = this.userService.getLoggedInUser();
    if (user.currentStore == store._id) {
      return await Promise.reject({
        error: 'DEFAULT_STORE_EXISTS',
        error_msg: 'This is your current store. Please switch to other one before deleting it.'
      });
    } else {
      try {
        if (!associated) {
          return await super.delete(store);
        } else {
          await this.appService.deleteStoreAssociations(store);
          return await super.delete(store);
        }
      } catch (err) {
        return Promise.reject(err);
      }
    }
  }
}