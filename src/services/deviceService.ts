import { Injectable } from '@angular/core';
import { BaseEntityService } from "@simpleidea/simplepos-core/dist/services/baseEntityService";
import { Device } from "../model/device";

@Injectable()
export class DeviceService extends BaseEntityService<Device> {
  constructor() {
    super(Device);
  }
}