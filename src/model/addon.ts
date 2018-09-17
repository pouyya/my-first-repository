import {DBBasedEntity} from "@simplepos/core/dist/model/dbBasedEntity";

export enum AddonType {
  Table = 'Table'
} 

export class Addon extends DBBasedEntity  {
  public isEnabled: boolean;
  public addonType: string;
  public createdAt: string;
}