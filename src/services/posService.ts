import { User } from './../model/user';
import { UserService } from './userService';
import { HelperService } from './helperService';
import { Injectable, NgZone } from '@angular/core';
import { BaseEntityService } from  './baseEntityService';
import { POS } from './../model/pos';

@Injectable()
export class PosService extends BaseEntityService<POS> {
  constructor(
    private helper: HelperService,
    private zone: NgZone,
    private userService: UserService
  ) {
    super(POS, zone);
  }

  public getCurrentPosID() {
    return this.userService.getUser().settings.currentPos;
  }

  public getCurrentPos() {
    return this.get(this.getCurrentPosID());
  }
}