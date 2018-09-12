import { Injectable } from '@angular/core';
import { BaseEntityService } from "@simplepos/core/dist/services/baseEntityService";
import { Addon } from "../model/addon";

@Injectable()
export class AddonService extends BaseEntityService<Addon> {

  constructor() {
    super(Addon);
  }

  public async getAddonsByAccountId(accountId: string, ): Promise<Addon[]> {
      const query: any = { selector: { entityTypeName: 'Addon' , accountId} };
      const addons = await this.findBy(query);
      return addons;
  }
}