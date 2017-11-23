import { UserService } from './userService';
import { Injectable } from '@angular/core';
import { BaseEntityService } from  './baseEntityService';
import { POS } from './../model/pos';

@Injectable()
export class PosService extends BaseEntityService<POS> {

  private _currentPos: POS;

  get currentPos(): POS {
    return this._currentPos;
  }

  set currentPos(pos: POS) {
    this._currentPos = pos;
  }

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
}