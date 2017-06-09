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

  public setupRegister(): Promise<any> {
    return new Promise((resolve, reject) => {
      // Hardcoded UI
      var posId = "22CB398C-BC5F-29F0-8F6B-8DC5522C945F";
      this.get(posId).then((pos) => {
        resolve(pos)
      }, (error) => {
        reject(new Error(error));
      });
    });  
  }  
}