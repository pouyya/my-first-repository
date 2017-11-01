import { EmployeeTimestamp } from './../model/employeeTimestamp';
import { BaseEntityService } from "./baseEntityService";
import { Injectable } from '@angular/core';

@Injectable()
export class EmployeeTimestampService extends BaseEntityService<EmployeeTimestamp> {

  public static readonly CLOCK_IN: string = "clock_in";
  public static readonly CLOCK_OUT: string = "clock_out";
  public static readonly BREAK_START: string = "break_start";
  public static readonly BREAK_END: string = "break_end";

  constructor() {
    super(EmployeeTimestamp);
  }

  public async getEmployeeTimestamps(employeeId: string) {
    try {
      return await this.findBy({ selector: { employeeId } });
    } catch (err) {
      throw new Error(err);
    }
  }

  /**
   * @param employeeId 
   * @param storeId 
   * @param type 
   * @returns {Promise<any>}
   */
  public async getEmployeeLatestTimestamp(employeeId: string, storeId: string, type?: string): Promise<any> {
    let selector: any = { employeeId, storeId }
    if (type) selector.type = type;
    try {
      let timestamps: EmployeeTimestamp[] = await this.findBy({
        selector,
        sort: [{ _id: 'desc' }]
      })
      return timestamps.length > 0 ? timestamps[0] : null;
    } catch (err) {
      return Promise.reject(err);
    }
  }
  
  /**
   * @param employeeId 
   * @param storeId 
   * @returns {Promise<any>}
   */
  public async getEmployeeLastTwoTimestamps(employeeId: string, storeId: string): Promise<any> {
    try {
      let timestamps: EmployeeTimestamp[] = await this.findBy({
        selector: { employeeId, storeId },
        sort: [{ _id: 'desc' }]
      });
      return timestamps.length > 0 ? {
        latest: timestamps[0],
        beforeLatest: timestamps[1] || null
      } : null;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  public async getTimestampsfromTo(from?: Date, to?: Date, raw: boolean = true): Promise<any> {
    try {
      let view = "employee_timelog/by_time"
      let record = await this.getDB().query(view);
      if(raw) {
        return record;
      }

      return record.rows.map(row => row.value);
    } catch (err) {
      return Promise.reject(err);
    }
  }
}