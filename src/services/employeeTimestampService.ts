import _ from 'lodash';
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
  public async getEmployeeLatestTimestamp(employeeId: string, storeId?: string, type?: string): Promise<any> {
    let selector: any = { employeeId }
    if (storeId) selector.storeId = storeId;
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

  public async getNonCheckOuts(raw: boolean = true) {
    try {
      let view = "non_logged_out_employees/for_yesterday";
      let record = await this.getDB().query(view);
      if (raw) {
        return record;
      }

      return record.rows.map(row => row.value);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Retrieve time logs by time frame
   * @param frame {Array<String>}
   * @param processSize {Number}
   */
  public async getTimestampsByFrame(frame: string[], processSize: number, getAll: boolean = false): Promise<any> {
    if(processSize > frame.length) {
      return Promise.reject("processSize exceeded!");
    }
    let view = "employee_timelog/by_time";
    let promises: any[] = [];

    let proccessedFrame: string[] = !getAll ? _.slice(frame, frame.length - processSize, frame.length - 1) : frame;

    proccessedFrame.forEach(day => {
      promises.push(async () => {
        let record = await this.getDB().query(view, { key: day });
        return record.rows.map(row => row.value);
      });
    });

    let records: any[] = await Promise.all(promises.map(promise => promise()));
    return _.flatten(records);
  }
}