import { Injectable } from "@angular/core";
import { BaseEntityService } from "@simpleidea/simplepos-core/dist/services/baseEntityService";
import { Audit, AuditAction } from "../model/audit";
import { SyncContext } from "./SyncContext";

@Injectable()
export class AuditService extends BaseEntityService<Audit> {

  constructor(private syncContext: SyncContext) {
    super(Audit);
  }

  /**
   * Pushes audit details to audit db
   */
  public async addAuditInfo(action: AuditAction, message: string): Promise<void> {
    let audit = new Audit();
    audit.storeId = this.syncContext.currentStore != null ? this.syncContext.currentStore._id : null;
    audit.posId = this.syncContext.currentPos ? this.syncContext.currentPos.id : null;
    audit.action = action;
    audit.message = message;
    this.add(audit);
  }
}