import { DBBasedEntity } from '@simplepos/core/dist/model/dbBasedEntity';
import { DBMode, DBModeEnum } from '@simplepos/core/dist/metadata/dbMode';

@DBMode(DBModeEnum.Current)
export class EmployeeTimestamp extends DBBasedEntity {
  public employeeId: string;
  public storeId: string;
  public type: string;
  public time: Date;
}