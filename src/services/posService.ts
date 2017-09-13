import { UserService } from './userService';
import { Injectable, NgZone } from '@angular/core';
import { BaseEntityService } from  './baseEntityService';
import { POS } from './../model/pos';

@Injectable()
export class PosService extends BaseEntityService<POS> {

  constructor(private zone: NgZone) {
    super(POS, zone);
  }
}