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
    var currentUser = await this.userService.getUser();
    let currentPos = await this.get(currentUser.currentPos);
    return currentPos.status;
  }

  public async getCurrentPos() : Promise<POS> {
    let currentUser = await this.userService.getUser();
    return this.get(currentUser.currentPos);
  }
}