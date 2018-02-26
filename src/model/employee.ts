import { DBBasedEntity } from '@simpleidea/simplepos-core/dist/model/dbBasedEntity';

export interface EmployeeRolePerStore {
  id: string;
  role: string;
}

export class Employee extends DBBasedEntity {
  public firstName: string;
  public lastName: string;
  public address: string;
  public phone: string;
  public isAdmin?: boolean;
  public store?: EmployeeRolePerStore[];
  public pin: number;
  public isActive: boolean;

  constructor() {
    super();
    this.isActive = true;
  }
}