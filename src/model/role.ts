import { DBBasedEntity } from "./dbBasedEntity";

export class Role extends DBBasedEntity {
  
  public name: string;
  public accessRightItems: string[];

}