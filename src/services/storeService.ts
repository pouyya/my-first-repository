import { AppService } from './appService';
import { UserService } from './userService';
import { Injectable } from '@angular/core';
import { Store } from '../model/store'
import { BaseEntityService } from './baseEntityService'

@Injectable()
export class StoreService extends BaseEntityService<Store> {

  private _currentStore: Store;

  get currentStore(): Store {
    return this._currentStore;
  }

  set currentStore(store: Store) {
    this._currentStore = store;
  }

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

  public getCurrentStore(): Promise<Store> {
    let user = this.userService.getLoggedInUser();
    return this.get(user.currentStore);
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