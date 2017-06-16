import { Closure } from './../model/closure';
import { Injectable, NgZone } from '@angular/core';
import {BaseEntityService} from  './baseEntityService';

@Injectable()
export class ClosureService extends BaseEntityService<Closure> {
  
  constructor(
    private zone: NgZone
  ) {
    super(Closure, zone)
  }

  public getAllByPOSId(posId: string) {
    return this.findBy({ selector: { posId: posId } });
  }

}