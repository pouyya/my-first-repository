import { Injectable } from '@angular/core';
import { BaseEntityService } from "@simpleidea/simplepos-core/dist/services/baseEntityService";
import { POS } from './../model/pos';
import * as moment from 'moment-timezone';
import { SyncContext } from "./SyncContext";
import { SharedService } from "./_sharedService";

@Injectable()
export class PosService extends BaseEntityService<POS> {

  constructor(
    private syncContext: SyncContext,
    private _sharedService: SharedService) {
    super(POS);
  }

  public async getAllPosByStoreId(storeId: string): Promise<Array<POS>> {
    return this.findBy({
      selector: { storeId }
    });
  }

  public async update(pos: POS): Promise<any> {
    if(this.syncContext.currentPos._id == pos._id){
      this._sharedService.publish('storeOrPosChanged', {currentPos: pos, currentStore : this.syncContext.currentStore});
    }
    return await super.update(pos);
  }

  public async isThisLastPosClosingInStore(posId: string): Promise<boolean> {

    var otherPosOfCurrentStoreStillOpen = await this.findBy({
      selector: {
        _id: { $ne: posId },
        storeId: this.syncContext.currentPos.storeId,
        openTime: { $gt: null }
      }
    });

    return !otherPosOfCurrentStoreStillOpen || otherPosOfCurrentStoreStillOpen.length <= 0
  }

  public openRegister(register: POS, openingAmount: number, openingNote: string): Promise<POS> {
    register.openTime = moment().utc().format();
    register.status = true;
    register.openingAmount = Number(openingAmount);
    register.openingNote = openingNote;
    return this.update(register);
  }

}