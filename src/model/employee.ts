import {DBBasedEntity} from './dbBasedEntity';

export class Employee extends DBBasedEntity {
  public firstName: string;
  public lastName: string;
  public address: string;
  public phone: number;
  public isAdmin: boolean;
  public store: Array<{ id: any, role: string }>;
}