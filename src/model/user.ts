import { DBBasedEntity } from './dbBasedEntity';

export class User extends DBBasedEntity {
  public firstName: string;
  public lastName: string;
  public currentStore: string;
  public currentPos: string;
}