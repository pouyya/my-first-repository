import { DBBasedEntity } from '@simplepos/core/dist/model/dbBasedEntity';

export class Role extends DBBasedEntity {
  
  public name: string;
  public accessRightItems: string[];

}