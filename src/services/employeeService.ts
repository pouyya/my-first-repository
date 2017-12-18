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

  private _employee: Employee = null;

  public getEmployee(): Employee {
    return this._employee;
  }

  public setEmployee(employee: Employee) {
    this._employee = employee;
  }

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
  public getById(id: string): Promise<any> {
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

  public async populateStores(stores: any[]): Promise<any> {
    let getStores: any[] = stores.map(async store => {
      try {
        store.store = await this.storeService.get(store.id);
        return store;
      } catch (err) {
        return Promise.reject(err);
      }
    });

    return await Promise.all(getStores);
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
  public async findByPin(pin: number): Promise<Employee> {
    var employees: Array<Employee> = await this.findBy({ selector: { pin } });
    return employees && employees.length > 0 ? employees[0] : null;
  }

  public async getClockedInEmployeesOfStore(storeId: string): Promise<Array<Employee>> {
    let currentDay = new Date(moment(new Date()).format("YYYY-MM-DD"));
    var employees = await this.getAll();
    var timeStamps = await this.employeeTimestampService.findBy({
      sort: [{ _id: 'desc' }],
      selector: {
        storeId,
        time: {
          $gte: currentDay
        }
      }
    });

    let preparedEmployees: Array<Employee> = [];

    if (timeStamps.length > 0) {
      employees.forEach(employee => {
        var currentEmployeeTimeStamp = _.orderBy(
          _.filter(timeStamps, (timeStamp) => timeStamp.employeeId == employee._id),
          ['_id'], ['desc']);

        if (currentEmployeeTimeStamp.length > 0) {
          let time: EmployeeTimestamp = currentEmployeeTimeStamp[0];
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
      });
    }

    return preparedEmployees;
  }

  public async getClockedInEmployeesToCurrentStore(): Promise<Array<Employee>> {
    let storeId = (await this.userService.getUser()).currentStore;
    return this.getClockedInEmployeesOfStore(storeId)
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

  public async clockOutCurrentStoreClockedIn(checkOutTime?: Date | string): Promise<any> {
    let currentStoreId: string = (await this.userService.getUser()).currentStore;
    let employees = await this.getClockedInEmployeesOfStore(currentStoreId);
    if (employees.length > 0) {

      checkOutTime = checkOutTime || new Date();
      let creations: Promise<any>[] = _.map(employees, (employee) => {
        let newTimestamp = new EmployeeTimestamp();
        newTimestamp.employeeId = employee._id;
        newTimestamp.storeId = currentStoreId;
        newTimestamp.type = EmployeeTimestampService.CLOCK_OUT;
        newTimestamp.time = moment(checkOutTime).utc().toDate();
        return this.employeeTimestampService.add(newTimestamp);
      });

      return await Promise.all(creations);
    }

    return Promise.resolve(null);
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
