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

  public update(register: POS): Promise<any> {
    return new Promise((resolve, reject) => {
      super.update(register).then(() => {
        // presist user
        let user = this.userService.getLoggedInUser();
        if(register._id == user.settings.currentPos) {
          user.currentPos = register;
          user.settings.currentPos = register._id;
          this.userService.persistUser(user);
        } 
        resolve();
      }).catch((error) => {
        reject(error);
      });
    });
  }
}