import {DBBasedEntity} from "@simplepos/core/dist/model/dbBasedEntity";
import {DBMode, DBModeEnum} from "@simplepos/core/dist/metadata/dbMode";

export enum ShiftStatus {
    Draft = 'draft',
    Published = 'published'
}

@DBMode(DBModeEnum.Current)
export class Shift extends DBBasedEntity {
    storeId: string;
    employeeId: string;
    status: ShiftStatus;
    startDate: Date;
    endDate: Date;
    break: number;
    note: string;
}