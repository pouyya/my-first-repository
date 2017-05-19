import {Injectable} from "@angular/core";
import {Employee} from "../model/employee";
import {BaseEntityService} from "./baseEntityService";
import {StoreService} from "./storeService";

@Injectable()
export class EmployeeService extends BaseEntityService<Employee> {
  constructor(private storeService: StoreService) {
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
}
