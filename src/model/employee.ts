import { DBBasedEntity } from './dbBasedEntity';
import { AccessRightItemID } from './accessItemRight';

export interface EmployeeStore {
  id: string;
  role: AccessRightItemID;
}

export class Employee extends DBBasedEntity {
  public firstName: string;
  public lastName: string;
  public address: string;
  public phone: string;
  public isAdmin?: boolean;
  public store?: EmployeeStore[];
  public pin: number;
}