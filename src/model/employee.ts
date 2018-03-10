import { DBBasedEntity } from '@simpleidea/simplepos-core/dist/model/dbBasedEntity';
import { DisplayColumn, FilterType, SearchFilter } from "../metadata/listingModule";

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
  @DisplayColumn(1)
  public firstName: string;
  public lastName: string;
  public address: string;
  public phone: string;
  public isAdmin?: boolean;
  public store?: EmployeeRolePerStore[];
  public pin: number;
  @SearchFilter(FilterType.Text, 1, 'Search by name')
  public fullname: string;
  @SearchFilter(FilterType.Boolean, 2)
  public isActive: boolean;
  public workingStatus: WorkingStatus;

  constructor() {
    super();
    this.isActive = true;
  }
}