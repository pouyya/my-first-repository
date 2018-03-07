import { DBBasedEntity } from '@simpleidea/simplepos-core/dist/model/dbBasedEntity';
import { DisplayColumn, FilterType, SearchFilter } from "../metadata/listingModule";

export interface EmployeeRolePerStore {
  id: string;
  role: string;
}

export class Employee extends DBBasedEntity {
  @DisplayColumn
  public firstName: string;
  public lastName: string;
  public address: string;
  public phone: string;
  public isAdmin?: boolean;
  public store?: EmployeeRolePerStore[];
  public pin: number;
  @SearchFilter(FilterType.Text, 'Search by name')
  public fullname: string;
  @SearchFilter(FilterType.Boolean)
  public isActive: boolean;

  constructor() {
    super();
    this.isActive = true;
  }
}