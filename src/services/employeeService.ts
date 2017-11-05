import _ from 'lodash';
import * as moment from "moment";
import { EmployeeTimestamp } from './../model/employeeTimestamp';
import { UserService } from './userService';
import { EmployeeTimestampService } from './employeeTimestampService';
import { Injectable } from "@angular/core";
import { Employee } from "../model/employee";
import { BaseEntityService } from "./baseEntityService";
import { StoreService } from "./storeService";

@Injectable()
export class EmployeeService extends BaseEntityService<Employee> {
  constructor(
    private storeService: StoreService,
    private userService: UserService,
    private employeeTimestampService: EmployeeTimestampService) {
    super(Employee);
  }

  /**
   * Get Employee with associated Stores
   * @param id
   * @returns {Promise<T>}
   */
  public getEmployee(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.findBy({
        selector: {
          _id: id
        }
      }).then(
        employee => {
          if (employee && employee.length > 0) {
            var promises: Array<any> = [];
            employee = employee[0];
            employee.store.forEach((item, index, array) => {
              promises.push(new Promise((resolve2, reject2) => {
                this.storeService.findBy({ selector: { _id: item.id } })
                  .then(
                  store => {
                    array[index].id = store[0];
                    resolve2();
                  },
                  error => {
                    console.log(error);
                    array.id = null;
                    resolve2();
                  }
                  );
              }))
            });

            Promise.all(promises).then(
              result => resolve(employee),
              error => reject(error)
            )
          } else {
            reject("No Employee was found");
          }
        }
        );
    });
  }

  public getAssociatedStores(stores: Array<any>): Promise<any> {
    return new Promise((resolve, reject) => {
      var promises: Array<any> = [];
      stores.forEach((item, index, array) => {
        promises.push(new Promise((resolve2, reject2) => {
          this.storeService.findBy({ selector: { _id: item.id } })
            .then(
            store => {
              array[index].store = store[0];
              resolve2();
            },
            error => {
              console.log(error);
              resolve2();
            }
            );
        }))
      });

      Promise.all(promises).then(
        result => resolve(stores),
        error => reject(error)
      )
    });
  }

  /**
   * Verify if pin is used or not
   * @param pin 
   * @returns {Promise<boolean>}
   */
  public verifyPin(pin: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.findBy({ selector: { pin } }).then((employees: Array<Employee>) => {
        resolve(!(employees.length > 0));
      }).catch(error => reject(error));
    });
  }

  /**
   * Find Employee By PIN
   * @param pin 
   * @returns {Promise<Employee>}
   */
  public findByPin(pin: number): Promise<Employee> {
    return new Promise((resolve, reject) => {
      this.findBy({ selector: { pin } }).then((employees: Array<Employee>) => {
        employees.length > 0 ? resolve(employees[0]) : reject();
      }).catch(error => reject(error));
    });
  }

  public async getListByCurrentStatus(): Promise<any> {
    let currentDay = new Date(moment(new Date()).format("YYYY-MM-DD"));
    let currentUser = await this.userService.getUser();
    return new Promise((resolve, reject) => {
      let storeId = currentUser.currentStore;
      this.findBy({
        selector: {
          store: {
            $elemMatch: {
              id: { $eq: storeId },
              role: { $eq: "staff" }
            }
          }
        }
      }).then((employees: Employee[]) => {
        let preparedEmployees: Array<any> = [];
        let timestamps: Array<Promise<any>> = [];
        employees.forEach(employee => {
          timestamps.push(this.employeeTimestampService.findBy({
            sort: [{ _id: 'desc' }],
            selector: {
              employeeId: employee._id,
              storeId,
              time: {
                $gte: currentDay
              }
            }
          }).then((ts: EmployeeTimestamp[]) => {
            if (ts.length > 0) {
              let time: EmployeeTimestamp = ts[0];
              let e: any = employee;
              e.disabled = false;
              if (time.type !== EmployeeTimestampService.CLOCK_OUT) {
                if (time.type == EmployeeTimestampService.BREAK_START) {
                  e.disabled = true;
                } else if (time.type == EmployeeTimestampService.BREAK_END || time.type == EmployeeTimestampService.CLOCK_OUT) {
                  e.disabled = false;
                }

                preparedEmployees.push(e);
              }
            }
            return;
          }).catch(error => {
            throw new Error(error);
          }));
        });

        Promise.all(timestamps).then(() => {
          resolve(preparedEmployees);
        }).catch(error => reject(error));
      }).catch(error => reject(error));
    });
  }

  public async findByStore(storeId: string) {
    try {
      return await this.findBy({
        selector: {
          store: {
            $elemMatch: {
              id: { $eq: storeId }
            }
          }
        }
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  public async updateBulk(employees: Employee[]): Promise<any> {
    try {
      return await Promise.all(employees.map(employee => this.update(employee)));
    } catch (err) {
      return Promise.reject(err);
    }
  }

  public async logOutAllStaffs() {
    try {
      let timeLogs: any[] = await this.employeeTimestampService.getNonCheckOuts(false);
      if (timeLogs.length > 0) {
        let logOutPromises: any[] = [];
        let clockOutTime: any = new Date();
        clockOutTime.setDate(clockOutTime.start.getDate() - 1);
        clockOutTime.setHours(23);
        clockOutTime.setMinutes(59);
        clockOutTime.setSeconds(59);
        let employees: any = _.groupBy(timeLogs, 'employeeId');
        _.forEach(employees, (value, key) => {
          employees[key] = _.groupBy(value, 'storeId');
          var stores = Object.keys(employees[key]);
          for (var i = 0; i < stores.length; i++) {
            let clockOutTimeStamp = new EmployeeTimestamp();
            clockOutTimeStamp.type = 'clock_out';
            clockOutTimeStamp.employeeId = key;
            clockOutTimeStamp.storeId = stores[i];
            clockOutTimeStamp.time = clockOutTime;
            logOutPromises.push(this.employeeTimestampService.add(clockOutTimeStamp));
          }
        });
        
        return await Promise.all(logOutPromises);
      }
      return [];
    } catch (err) {
      return Promise.reject(err);
    }
  }

}
