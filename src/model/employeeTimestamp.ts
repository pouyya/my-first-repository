import { DBBasedEntity } from './dbBasedEntity';

export class EmployeeTimestamp extends DBBasedEntity {
  public employeeId: string;
  public storeId: string;
  public type: string;
  public time: Date;
}