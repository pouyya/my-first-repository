import { DBBasedEntity } from './dbBasedEntity';
import { AccessItemRightID } from './accessItemRight';

export interface RolesInterface {
  id: string;
  roles: AccessItemRightID[];
}

export class Employee extends DBBasedEntity {
  public firstName: string;
  public lastName: string;
  public address: string;
  public phone: string;
  public isAdmin?: boolean;
  public store?: RolesInterface[];
  public pin: number;
}