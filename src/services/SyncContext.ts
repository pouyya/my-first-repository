import { Store, POS } from "../model/store";
import { Injectable } from "@angular/core";
import { SharedService } from "./_sharedService";

export interface ISyncContext {
  currentStore: Store;
  currentPos: POS
}

@Injectable()
export class SyncContext implements ISyncContext {

  private _currentStore: Store = null;
  private _currentPos: POS = null;

  constructor(private _sharedService: SharedService){}

  public initSubscribe(){
    this._sharedService
      .getSubscribe('storeOrPosChanged')
      .subscribe((data) => {
        if (data.hasOwnProperty('currentStore')) {
          this.currentStore = data.currentStore;
        }
        if (data.hasOwnProperty('currentPos')){
          this.currentPos = data.currentPos;
        }
      });
  }

  public get currentStore(): Store {
    return this._currentStore;
  }

  public set currentStore(store: Store){
    this._currentStore = store;
  }

  public get currentPos(): POS {
    return this._currentPos;
  }

  public set currentPos(pos: POS){
    this._currentPos = pos;
  }

}