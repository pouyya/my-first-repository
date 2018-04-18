import { Store, POS } from "../model/store";
import { Injectable } from "@angular/core";
import { SharedService } from "./_sharedService";
import { DBService } from "@simpleidea/simplepos-core/dist/services/dBService";
import { DBDataEvent } from "@simpleidea/simplepos-core/dist/db/dbDataEvent";

export interface ISyncContext {
  currentStore: Store;
  currentPos: POS
}

@Injectable()
export class SyncContext implements ISyncContext {

  private _currentStore: Store = null;
  private _currentPos: POS = null;

  constructor(private _sharedService: SharedService){}

  private initDBChange() {
    DBService.criticalDBLiveProgress.subscribe((data: DBDataEvent) => {
        if (data.isValid && data.entityTypeName == "Store" && data.data._id === this.currentStore._id) {
            this._currentStore = data.data;
            this.setCurrentPos(this._currentPos.id);
        }
    });
  }

  public initialize(currentStore: Store, currentPosId: string, reInit: boolean = false){
    this._currentStore = currentStore;
    this.setCurrentPos(currentPosId);
    !reInit && this.initDBChange();
  }

  public get currentStore(): Store {
    return this._currentStore;
  }

  public set currentStore(store: Store){
    this._currentStore = store;
    this._sharedService.publish('storeOrPosChanged', { currentStore: store, currentPos: this.currentPos });
  }

  public get currentPos(): POS {
    return this._currentPos;
  }

  public setCurrentPos(posId: string){
    this._currentStore.POS && this._currentStore.POS.some( pos => {
      if(pos.id === posId){
          this._currentPos = pos;
          return true;
      }
    });
    this._sharedService.publish('storeOrPosChanged', { currentStore: this._currentStore, currentPos: this._currentPos });
  }
}