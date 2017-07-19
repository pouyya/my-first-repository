import { DBBasedEntity } from './dbBasedEntity';

export class UserSettings extends DBBasedEntity {

  public userId: string;
  public currentStore: string;
  public currentPos: string;
  public defaultIcon: string;
}