import { Injectable } from '@angular/core';
import { AccountSettingService } from '../modules/dataSync/services/accountSettingService';

@Injectable()
export class FountainService {

  constructor(
    private accountSettingService: AccountSettingService
  ) { }

  public async getReceiptNumber() {
    var currentAccountSetting = await this.accountSettingService.getCurrentSetting();
    currentAccountSetting.saleLastNumber = (currentAccountSetting.saleLastNumber || 0) + 1;
    await this.accountSettingService.update(currentAccountSetting);
    return `${currentAccountSetting.saleNumberPrefix || 'RC'}${currentAccountSetting.saleLastNumber}`;
  }

  public async getClosureNumber() {
    var currentAccountSetting = await this.accountSettingService.getCurrentSetting();
    currentAccountSetting.closureLastNumber = (currentAccountSetting.closureLastNumber || 0) + 1;
    await this.accountSettingService.update(currentAccountSetting);
    return `${currentAccountSetting.closureNumberPrefix || 'CL'}${currentAccountSetting.closureLastNumber}`;
  }

  public async getOrderNumber() {
    return await Promise.resolve(`O${Math.round(Math.random() * 1000)}`);
  }

}