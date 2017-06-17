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
    return new Promise((resolve,reject) => {
      this.userService.getLoggedInUser().then((user: User) => {
        resolve(user.currentPos);
      })
    });
  }

  public setupRegister(): Promise<any> {
    return new Promise((resolve, reject) => {
      // Hardcoded UI
      this.getCurrentPosID().then((posId) => {
        this.get(posId).then((pos) => {
          resolve(pos)
        }, (error) => {
          reject(new Error(error));
        });
      });
    });
  }

  public getCurrentPos(): Promise<any> {
    return new Promise((resolve,reject) => {
      this.getCurrentPosID().then((posId) => {
        this.get(posId)
        .then(pos => resolve(pos))
        .catch(error => reject(error));
      });
    });
  }
}