import _ from 'lodash';
import { EmployeeTimestamp } from './../model/employeeTimestamp';
import { BaseEntityService } from "@simpleidea/simplepos-core/dist/services/baseEntityService";
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

  /**
   * Retrieve time logs by time frame
   * @param frame {Array<String>}
   * @param processSize {Number}
   */
  public async getTimestampsByFrame(frame: string[], processSize: number, getAll: boolean = false): Promise<any> {
    if (processSize > frame.length) {
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

    try {
      let records: any[] = await Promise.all(promises.map(promise => promise()));
      return _.flatten(records);
    } catch (err) {
      return Promise.reject(err);
    }
  }
}