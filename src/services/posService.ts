import { UserService } from './userService';
import { Injectable } from '@angular/core';
import { BaseEntityService } from  './baseEntityService';
import { POS } from './../model/pos';

@Injectable()
export class PosService extends BaseEntityService<POS> {


  constructor(private userService: UserService) {
    super(POS);
  }

  public async getCurrentPosStatus(): Promise<boolean> {
    var currentUser = this.userService.getLoggedInUser();
    let currentPos = await this.get(currentUser.currentPos);
    return currentPos.status;
  }

  public async getCurrentPos() : Promise<POS> {
    let user = this.userService.getLoggedInUser();
    return this.get(user.currentPos);
  }

  public getFirst(): Promise<POS> {
    // Main point-of-sale
    // Hard coded for now
    return this.get("2017-07-18T11:40:52.927Z");
  }
}