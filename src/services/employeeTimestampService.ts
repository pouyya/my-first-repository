import { NgZone } from '@angular/core';
import { EmployeeTimestamp } from './../model/employeeTimestamp';
import { BaseEntityService } from "./baseEntityService";
import { Injectable } from '@angular/core';

@Injectable()
export class EmployeeTimestampService extends BaseEntityService<EmployeeTimestamp> {

  public static readonly CLOCK_IN: string = "clock_in";
  public static readonly CLOCK_OUT: string = "clock_out";
  public static readonly BREAK_START: string = "break_start";
  public static readonly BREAK_END: string = "break_end";

  constructor(private zone: NgZone) {
    super(EmployeeTimestamp, zone);
  }

  public getEmployeeLatestTimestamp(employeeId: string, storeId: string) {
    return new Promise((resolve, reject) => {
      this.findBy({
        selector: { employeeId, storeId },
        sort: [{_id: 'desc'}]
      }).then((timestamps: Array<EmployeeTimestamp>) => {
        timestamps.length > 0 ? resolve(timestamps[0]) : resolve(null);
      }).catch(error => reject(error));
    });
  }

}