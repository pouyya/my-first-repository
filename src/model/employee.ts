import { DBBasedEntity } from '@simpleidea/simplepos-core/dist/model/dbBasedEntity';

export interface EmployeeRolePerStore {
  id: string;
  role: string;
}


export enum WorkingStatusEnum {
  ClockedIn = 1,
  ClockedOut,
  BreakStart,
  BreakEnd
}

export interface WorkingStatus {
  status: WorkingStatusEnum;
  posId: string;
  storeId: string;
  time: Date
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
  public fullname: string;
  public workingStatus: WorkingStatus;

  constructor() {
    super();
    this.isActive = true;
  }
}