import * as moment from "moment";
import { EmployeeTimestamp } from './../model/employeeTimestamp';
import { EmployeeTimestampService } from './employeeTimestampService';
import { Injectable } from "@angular/core";
import { Employee, WorkingStatusEnum } from "../model/employee";
import { BaseEntityService } from "@simplepos/core/dist/services/baseEntityService";
import { SyncContext } from "./SyncContext";
import { DateTimeService } from "./dateTimeService";

@Injectable()
export class EmployeeService extends BaseEntityService<Employee> {

  private _employee: Employee = null;

  public getEmployee(): Employee {
    return this._employee;
  }

  public setEmployee(employee: Employee) {
    this._employee = employee;
  }

  constructor(private employeeTimestampService: EmployeeTimestampService, 
    private syncContext: SyncContext,
    private dateTimeService: DateTimeService) {
    super(Employee);
  }

  /**
   * @Override
   * @param employee
   */
  public async add(employee: Employee): Promise<any> {
    employee.fullname = (`${employee.firstName} ${employee.lastName}`).trim().toLowerCase();
    return await super.add(employee);
  }

  /**
   * @Override
   * @param employee
   */
  public async update(employee: Employee): Promise<any> {
    employee.fullname = (`${employee.firstName} ${employee.lastName}`).trim().toLowerCase();
    return await super.update(employee);
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
    let employees: Employee[] = await this.getAll();

    return employees.filter(employee => employee.workingStatus &&
      employee.workingStatus.storeId == storeId &&
      (employee.workingStatus.status == WorkingStatusEnum.ClockedIn ||
        employee.workingStatus.status == WorkingStatusEnum.BreakStart ||
        employee.workingStatus.status == WorkingStatusEnum.BreakEnd));
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

  private clockOutEmployee(employee: Employee, currentStoreId: string, checkOutTime: Date | string) {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        let newTimestamp = new EmployeeTimestamp();
        newTimestamp.employeeId = employee._id;
        newTimestamp.storeId = currentStoreId;
        newTimestamp.type = EmployeeTimestampService.CLOCK_OUT;
        newTimestamp.time = moment(checkOutTime).utc().toDate();
        newTimestamp.createdAtLocalDate = this.dateTimeService.getLocalDateString(checkOutTime);

        employee.workingStatus.status = WorkingStatusEnum.ClockedOut;
        employee.workingStatus.posId = this.syncContext.currentPos.id;
        employee.workingStatus.storeId = currentStoreId;
        employee.workingStatus.time = new Date();

        await Promise.all([this.employeeTimestampService.add(newTimestamp), this.update(employee)]);
        resolve();
      })
    });
  }

  public async clockOutClockedInOfStore(currentStoreId: string, checkOutTime?: Date | string): Promise<any> {
    const employees = await this.getClockedInEmployeesOfStore(currentStoreId);
    if (employees.length > 0) {
      checkOutTime = checkOutTime || new Date();
      let creations: Promise<any>[] = employees.map(employee => this.clockOutEmployee(employee, currentStoreId, checkOutTime));
      return await Promise.all(creations);
    }

    return Promise.resolve(null);
  }
}
