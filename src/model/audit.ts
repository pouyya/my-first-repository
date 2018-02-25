import { DBModeEnum, DBMode } from "@simpleidea/simplepos-core/dist/metadata/dbMode";
import { DBBasedEntity } from "@simpleidea/simplepos-core/dist/model/dbBasedEntity";


@DBMode(DBModeEnum.Audit)
export class Audit extends DBBasedEntity {
  public created: string;
  public storeId: string;
  public posId: string;
  public pin: number;
  public image: string;
  constructor() {
    super();
    this.created = new Date().toISOString();
    this.image = '';
  }
}