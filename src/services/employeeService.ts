import {Injectable, NgZone} from "@angular/core";
import {Employee} from "../model/employee";
import {BaseEntityService} from "./baseEntityService";
import {StoreService} from "./storeService";

@Injectable()
export class EmployeeService extends BaseEntityService<Employee> {
  constructor(private storeService: StoreService, private zone : NgZone) {
    super(Employee, zone);
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
            if(employee && employee.length > 0) {
              var promises: Array<any> = [];
              employee = employee[0];
              employee.store.forEach((item, index, array) => {
                promises.push(new Promise((resolve2, reject2) => {
                  this.storeService.findBy({selector: { _id: item.id }})
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
          this.storeService.findBy({selector: { _id: item.id }})
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

}
