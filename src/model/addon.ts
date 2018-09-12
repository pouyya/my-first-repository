import {DBBasedEntity} from "@simplepos/core/dist/model/dbBasedEntity";

export class Addon extends DBBasedEntity  {
  public isEnabled: boolean;
  public addonType: string;
  public createdAt: string;
}