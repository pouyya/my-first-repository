import { AppService } from './appService';
import { Injectable } from '@angular/core';
import { Store } from '../model/store'
import { BaseEntityService } from "@simpleidea/simplepos-core/dist/services/baseEntityService";
import { PosService } from './posService';
import * as _ from 'lodash';
import { SyncContext } from "./SyncContext";
import { SharedService } from "./_sharedService";

@Injectable()
export class StoreService extends BaseEntityService<Store> {

  constructor(
    private appService: AppService,
    private posService: PosService,
    private syncContext: SyncContext,
    private _sharedService: SharedService) {
    super(Store);
  }


  /**
   * Delete Store, with all associations if option turned on
   * @param store
   * @param associated
   * @returns {Promise<any>}
   */
  public async delete(store: Store, associated: boolean = false): Promise<any> {
    if (this.syncContext.currentStore._id == store._id) {
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

  public async update(store: Store): Promise<any> {
    if(this.syncContext.currentStore._id == store._id){
      this._sharedService.publish('storeOrPosChanged', {currentStore : store, currentPos : this.syncContext.currentPos});
    }
    return await super.update(store);
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