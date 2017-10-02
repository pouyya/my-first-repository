import { DBBasedEntity } from './dbBasedEntity';

export class User extends DBBasedEntity {
  public username: string;
  public email: string;
  public password: string;  
  public firstName: string;
  public lastName: string;
  public currentStore: string;
  public currentPos: string;
}