import { HelperService } from './helperService';
import { Injectable } from '@angular/core'

@Injectable()
export class PosService {

  constructor(
    private helper: HelperService
  ) {}

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