import { HelperService } from './helperService';
import { Injectable, NgZone } from '@angular/core';
import { BaseEntityService } from  './baseEntityService';
import { POS } from './../model/pos';

@Injectable()
export class PosService extends BaseEntityService<POS> {

  constructor(
    private helper: HelperService,
    private zone: NgZone
  ) {
    super(POS, zone);
  }

  public getCurrentPosID(): string {
    // TODO: Replace hardcoded POSID with sessions stored ID
    var posId = localStorage.getItem('pos_id');
    if(!posId) {
      localStorage.setItem('pos_id', new Date().toISOString());
      posId = localStorage.getItem('pos_id');
    }
    
    return posId;
  }
}