import {Injectable} from "@angular/core";
import {Employee} from "../model/employee";
import {BaseEntityService} from "./baseEntityService";

@Injectable()
export class EmployeeService extends BaseEntityService<Employee> {
  constructor() {
    super(Employee);
  }
}
