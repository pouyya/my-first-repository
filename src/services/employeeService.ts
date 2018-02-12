import _ from 'lodash';
import * as moment from "moment";
import { EmployeeTimestamp } from './../model/employeeTimestamp';
import { EmployeeTimestampService } from './employeeTimestampService';
import { Injectable } from "@angular/core";
import { Employee } from "../model/employee";
import { BaseEntityService } from "@simpleidea/simplepos-core/dist/services/baseEntityService";

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
    private employeeTimestampService: EmployeeTimestampService) {
    super(Employee);
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
    let employees: Array<Employee> = await this.findBy({ selector: { pin } });
    return employees && employees.length > 0 ? employees[0] : null;
  }

  public async getClockedInEmployeesOfStore(storeId: string): Promise<Array<Employee>> {

    var currentStorePeriodTimeStamps = await this.employeeTimestampService.getAllTimeStampOfCurrentPeriodOfStore(storeId);

    let clockedInEmployees: Array<Employee> = [];

    if (currentStorePeriodTimeStamps.length > 0) {

      var employees = await this.getAll();

      employees.forEach(employee => {
        var currentEmployeeTimeStamps = _.filter(
          currentStorePeriodTimeStamps,
          (timeStamp) => timeStamp.employeeId == employee._id);

        if (currentEmployeeTimeStamps.length > 0) {
          let currentEmployeetimeStamp: EmployeeTimestamp = currentEmployeeTimeStamps[0];
          let e: any = employee;
          e.disabled = false;
          if (currentEmployeetimeStamp.type !== EmployeeTimestampService.CLOCK_OUT) {
            e.disabled = currentEmployeetimeStamp.type == EmployeeTimestampService.BREAK_START;
            clockedInEmployees.push(e);
          }
        }
      });
    }

    return clockedInEmployees;
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

  public async searchByName(name) {
    try {
      let employees: Employee[] = await this.findBy({
        selector: {
          // will later upgrade to support full name search
          firstName: {
            $regex: new RegExp(name, "ig")
          }
        }
      });

      return employees.length > 0 ? employees : [];
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

  public async clockOutClockedInOfStore(currentStoreId: string, checkOutTime?: Date | string): Promise<any> {
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
}
