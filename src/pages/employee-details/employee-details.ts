import {Component, OnInit} from "@angular/core";
import {Employee} from "../../model/employee";
import {EmployeeService} from "../../services/employeeService";

@Component({
  selector: 'employee-detail',
  templateUrl: 'employee-details.html'
})
export class EmployeeDetails implements OnInit {

  public employee: object;
  public isAdmin: boolean;
  private _id: string; // hardcoded employee id

  constructor(private employeeService: EmployeeService) {
    this._id = 'D254EFF2-733E-16CC-A179-B0F9FDA760B5';
  }

  ngOnInit(): void {
    this.employee = {};
    this.employeeService.getEmployee(this._id).then(
        (employee) => {
          console.log(employee);
          this.employee = employee;
        },
        (error) => {
          alert("There was an error");
          console.error(error);
        }
    );

  }

  updateIsAdmin() {

  }

  updateRole(id: string, role: string): void {

  }

}
