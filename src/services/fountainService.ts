import { Injectable } from '@angular/core';
import { SyncContext } from "./SyncContext";
import { StoreService } from "./storeService";
import { AccountSettingService } from "../modules/dataSync/services/accountSettingService";
import {AccountSetting} from "../modules/dataSync/model/accountSetting";

@Injectable()
export class FountainService {
  private accountSettings: AccountSetting;
  constructor(
  	private accountSettingService: AccountSettingService,
    private syncContext: SyncContext,
    private storeService: StoreService
  ) { }

  private async getAccountSettings(){
    if(!this.accountSettings){
      this.accountSettings = await this.accountSettingService.getCurrentSetting();
    }
    return this.accountSettings;
  }
  public async getReceiptNumber() {
    const currentAccountSetting = await this.getAccountSettings();
    this.syncContext.currentStore.saleLastNumber = (this.syncContext.currentStore.saleLastNumber || 0) + 1;
    await this.storeService.update(this.syncContext.currentStore);
    return `${currentAccountSetting.saleNumberPrefix || 'RC'}${this.syncContext.currentStore.saleLastNumber}`;
  }

  public async getClosureNumber() {
    const currentAccountSetting = await this.getAccountSettings();
    this.syncContext.currentStore.closureLastNumber = (this.syncContext.currentStore.closureLastNumber || 0) + 1;
    await this.storeService.update(this.syncContext.currentStore);
    return `${currentAccountSetting.closureNumberPrefix || 'CL'}${this.syncContext.currentStore.closureLastNumber}`;
  }

  public async getOrderNumber() {
    return await Promise.resolve(`O${Math.round(Math.random() * 1000)}`);
  }

}