import { Injectable } from '@angular/core';
import { BaseEntityService } from "@simplepos/core/dist/services/baseEntityService";
import { Addon } from "../model/addon";

@Injectable()
export class AddonService extends BaseEntityService<Addon> {

  constructor() {
    super(Addon);
  }
}