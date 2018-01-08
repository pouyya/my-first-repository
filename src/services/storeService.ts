import { AppService } from './appService';
import { UserService } from './userService';
import { Injectable } from '@angular/core';
import { Store } from '../model/store'
import { BaseEntityService } from './baseEntityService'
import { PosService } from './posService';
import * as _ from 'lodash';

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
    private appService: AppService,
    private posService: PosService) {
    super(Store);
  }

  public async getDefaultTax(): Promise<any> {
    let user = await this.userService.getUser();
    return this.findBy({
      selector: { _id: user.currentStore },
      fields: ["defaultSaleTaxId"]
    });
  }

  public async getCurrentStore(): Promise<Store> {
    let user = await this.userService.getUser();
    return this.get(user.currentStore);
  }

  /**
   * Delete Store, with all associations if option turned on
   * @param store
   * @param associated
   * @returns {Promise<any>}
   */
  public async delete(store: Store, associated: boolean = false): Promise<any> {
    let user = await this.userService.getUser();
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

  public async getCurrentStartPeriod(storeId: string): Promise<Date> {
    var poses = await this.posService.getAllPosByStoreId(storeId);

    if (poses && poses.length > 0) {

      var openedPoses = _.orderBy(
        _.filter(poses,
          pos => pos != null && pos.hasOwnProperty('openTime') && pos.openTime != null && pos.openTime != undefined),
        ['openTime']);

      if (openedPoses && openedPoses.length > 0) {

        var earliestOpenedPOS = openedPoses[0];

        return new Date(earliestOpenedPOS.openTime);
      }
    }

    return null;
  }
}