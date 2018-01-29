import { Injectable } from '@angular/core';
import { BaseEntityService } from "@simpleidea/simplepos-core/dist/services/baseEntityService";
import { POS } from './../model/pos';
import * as moment from 'moment-timezone';
import { UserService } from '../modules/dataSync/services/userService';

@Injectable()
export class PosService extends BaseEntityService<POS> {

  constructor(private userService: UserService) {
    super(POS);
  }

  public async getCurrentPosStatus(): Promise<boolean> {
    var currentUser = await this.userService.getUser();
    let currentPos = await this.get(currentUser.currentPos);
    return currentPos.status;
  }

  public async getCurrentPos(): Promise<POS> {
    let currentUser = await this.userService.getUser();
    return this.get(currentUser.currentPos);
  }

  public async getAllPosByStoreId(storeId: string): Promise<Array<POS>> {
    return this.findBy({
      selector: { storeId }
    });
  }

  public async isThisLastPosClosingInStore(posId: string): Promise<boolean> {

    var currentPos = await this.get(posId);
    var otherPosOfCurrentStoreStillOpen = await this.findBy({
      selector: {
        _id: { $ne: posId },
        storeId: currentPos.storeId,
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