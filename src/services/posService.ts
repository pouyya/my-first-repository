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
    let currentPos = await this.get(currentUser.settings.currentPos);
    return currentPos.status;
  }
}