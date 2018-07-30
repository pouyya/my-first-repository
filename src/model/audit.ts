import { DBModeEnum, DBMode } from "@simplepos/core/dist/metadata/dbMode";
import { DBBasedEntity } from "@simplepos/core/dist/model/dbBasedEntity";


export enum AuditAction {
  PIN
}

@DBMode(DBModeEnum.Audit)
export class Audit extends DBBasedEntity {
  public created: string;
  public storeId: string;
  public posId: string;
  public message: string;
  public action: AuditAction;
  public image: string;
  constructor() {
    super();
    this.created = new Date().toISOString();
    this.image = '';
  }
}