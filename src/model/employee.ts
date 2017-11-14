import {DBBasedEntity} from './dbBasedEntity';

export interface RolesInterface {
  id: string;
  roles: string[];
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