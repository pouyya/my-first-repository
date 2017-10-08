import { UserService } from './userService';
import { Injectable, NgZone } from '@angular/core';
import { BaseEntityService } from  './baseEntityService';
import { POS } from './../model/pos';

@Injectable()
export class PosService extends BaseEntityService<POS> {


  constructor(private zone: NgZone, private userService: UserService) {
    super(POS, zone);
  }

  public async getCurrentPosStatus(): Promise<boolean> {
    var currentUser = this.userService.getLoggedInUser();
    let currentPos = await this.get(currentUser.settings.currentPos);
    return currentPos.status;
  }
}