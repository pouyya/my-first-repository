import { DBBasedEntity } from './dbBasedEntity';
import { DBMode, DBModeEnum } from '../metadata/dbMode';

@DBMode(DBModeEnum.Current)
export class EmployeeTimestamp extends DBBasedEntity {
  public employeeId: string;
  public storeId: string;
  public type: string;
  public time: Date;
}