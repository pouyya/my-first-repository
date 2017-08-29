import { DBBasedEntity } from './dbBasedEntity';

export class EmployeeTimestamp extends DBBasedEntity {
  public employeeId: string;
  public timeIn: Date;
  public breakStart: Date;
  public breakEnd: Date;
  public timeout: Date;
  public totalTimeDuration: any; // timeIn - timeOut
  public created: Date;
}