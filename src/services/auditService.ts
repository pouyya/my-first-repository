import { Injectable } from "@angular/core";
import { BaseEntityService } from "@simpleidea/simplepos-core/dist/services/baseEntityService";
import { Audit } from "../model/audit";
import { UserService } from "../modules/dataSync/services/userService";

@Injectable()
export class AuditService extends BaseEntityService<Audit> {

  constructor(private userService: UserService) {
    super(Audit);
  }

  /**
   * Pushes audit details to audit db
   * @param pin
   * @returns {Promise<void>}
   */
  public async addAuditInfo(pin: number): Promise<void>{
    let currentUser = await this.userService.getUser();
    let audit = new Audit();
    audit.storeId = currentUser.currentStore;
    audit.posId = currentUser.currentPos;
    audit.pin = pin;
    this.add(audit);
  }
}