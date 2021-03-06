import { AppService } from './appService';
import { Injectable } from '@angular/core';
import { Store, POS } from '../model/store'
import { BaseEntityService } from "@simpleidea/simplepos-core/dist/services/baseEntityService";
import { SyncContext } from "./SyncContext";
import * as moment from "moment-timezone";

@Injectable()
export class StoreService extends BaseEntityService<Store> {

  constructor(
    private appService: AppService,
    private syncContext: SyncContext) {
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

  public openRegister(register: POS, openingAmount: number, openingNote: string): Promise<Store> {
      register.openTime = moment().utc().format();
      register.status = true;
      register.openingAmount = Number(openingAmount);
      register.openingNote = openingNote;
      return this.update(this.syncContext.currentStore);
  }

  public getPosById(posId: string, store?: Store){
    const currentStore = store || this.syncContext.currentStore;
    const pos = currentStore.POS.filter( pos => pos.id === posId);
    return pos.length && pos[0] || null;
  }

  public async addPOS(pos: POS[], store?: Store){
    const currentStore = store || this.syncContext.currentStore;
    currentStore.POS = [...currentStore.POS, ...pos];
    await this.update(currentStore);
  }
  public async updatePOS(pos: POS, store?: Store){
    const currentStore = store || this.syncContext.currentStore;
    currentStore.POS.some( ( register, index ) => {
      if(register.id === pos.id){
        currentStore.POS[index] = pos;
        return true;
      }
    });
    await this.update(currentStore);
  }

  public async removePOS(pos: POS){
      this.syncContext.currentStore.POS.some( ( register, index ) => {
          if(register.id === pos.id){
              this.syncContext.currentStore.POS.splice(index, 1);
              return true;
          }
      });
      await this.update(this.syncContext.currentStore);
  }

  public isThisLastPosClosingInStore(posId: string): boolean {
    let isLastPos = true;
    this.syncContext.currentStore.POS.some( pos => {
        if(pos.openTime && pos.id !== posId){
            isLastPos = false;
            return true;
        }
    });
    return isLastPos;
  }
}