import { BaseEntityService } from "@simplepos/core/dist/services/baseEntityService";
import {Shift} from "../model/shift";

export class ShiftService extends BaseEntityService<Shift> {

  constructor() {
    super(Shift);
  }

  public async getAllByStore(storeId: string): Promise<Shift[]>{
      return this.findBy({
          selector: {
              storeId
          }
      });
  }

}