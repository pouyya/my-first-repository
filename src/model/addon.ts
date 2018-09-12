import {DBBasedEntity} from "@simplepos/core/dist/model/dbBasedEntity";

export class Addon extends DBBasedEntity  {
  public isEnabled: boolean;
  public accountId: string;
  public addonType: string;
  public createdAt: string;
}