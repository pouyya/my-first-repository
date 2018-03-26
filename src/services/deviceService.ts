import { Injectable } from '@angular/core';
import { BaseEntityService } from "@simpleidea/simplepos-core/dist/services/baseEntityService";
import { Device } from "../model/device";
import { SyncContext } from "./SyncContext";

@Injectable()
export class DeviceService extends BaseEntityService<Device> {
  constructor(private syncContext: SyncContext) {
    super(Device);
  }


  public async getCurrentStoreDevices(): Promise<any> {
    let devices = await this.getAll();
    const currentStoreDevices = devices.filter(device => device.storeId === this.syncContext.currentStore._id)
    return currentStoreDevices;
  }

}