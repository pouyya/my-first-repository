import { Store, POS } from "../model/store";
import { Injectable } from "@angular/core";
import { DBService } from "@simpleidea/simplepos-core/dist/services/dBService";
import { DBDataEvent } from "@simpleidea/simplepos-core/dist/db/dbDataEvent";

export interface ISyncContext {
  currentStore: Store;
  currentPos: POS
}

export interface IConfig {
    timezone: string;
}

@Injectable()
export class SyncContext implements ISyncContext {
  private isSubscribed: boolean = false;
  private _currentStore: Store = null;
  private _currentPos: POS = null;
  private _currentConfig: IConfig;
  private _appTimezone: string = null;

  constructor() {
    this._currentConfig = <any>{};
  }

  private subscribeCriticalDBLiveProgress() {
    DBService.criticalDBLiveProgress.subscribe((data: DBDataEvent) => {
      if (data.isValid && data.entityTypeName == "Store" && data.data._id === this.currentStore._id) {
        this.currentStore = data.data;
        this.setCurrentPos(this.currentPos.id);
      }
    });
  }

  public initialize(currentStore: Store, currentPosId: string) {
    this.currentStore = currentStore;
    this.setCurrentPos(currentPosId);
    if (!this.isSubscribed) {
      this.subscribeCriticalDBLiveProgress();
      this.isSubscribed = true;
    }
  }

  public get currentStore(): Store {
    return this._currentStore;
  }

  public set currentStore(store: Store) {
    this._currentStore = store;
    if(this._currentStore.timezone){
      this._currentConfig.timezone = this._currentStore.timezone;
    }else{
      this._currentConfig.timezone = this.appTimezone;
    }
  }


  public get currentPos(): POS {
    return this._currentPos;
  }

  public setCurrentPos(posId: string) {
    if (this.currentStore.POS && this.currentStore.POS.length > 0) {
      if (!this.currentStore.POS.some(pos => {
        if (pos.id === posId) {
          this._currentPos = pos;
          return true;
        }
      })) {
        this._currentPos = this.currentStore.POS[0];
      }
    } else {
      this._currentPos = null;
    }
  }

  public get appTimezone(): string {
      return this._appTimezone;
  }

  public set appTimezone(appTimezone: string) {
    this._appTimezone = appTimezone;
    if(!this.currentStore.timezone){
      this._currentConfig.timezone = this.appTimezone;
    }
  }

  public get timezone(): string {
    return this._currentConfig.timezone;
  }
}