import { EmployeeDetails } from './../employee-details/employee-details';
import { EmployeeService } from './../../services/employeeService';
import { Component, NgZone } from '@angular/core';
import { Employee } from "../../model/employee";
import { NavController, AlertController, Platform } from 'ionic-angular';
import { BackOfficeModule } from '../../modules/backOfficeModule';
import { PageModule } from '../../metadata/pageModule';
import { SecurityGuard } from '../../metadata/securityGuardModule';
import { EmployeesPageRoleModule } from './../../modules/roles/employeesPageRoleModule';

@SecurityGuard(() => EmployeesPageRoleModule)
@PageModule(() => BackOfficeModule)
@Component({
  selector: 'page-employees',
  templateUrl: 'employees.html',
})
export class Employees {

  public items: Array<Employee> = [];
  public itemsBackup = [];

  constructor(public navCtrl: NavController,
    private alertCtrl: AlertController,
    private service: EmployeeService,
    private platform: Platform,
    private zone: NgZone) {
  }

  ionViewDidEnter() {
    this.platform.ready().then(() => {

      this.service.getAll()
        .then(data => {
          this.zone.run(() => {
            this.items = data;
            this.itemsBackup = data;
          });
        })
        .catch(console.error.bind(console));
    });
  }

  showDetail(item) {
    this.navCtrl.push(EmployeeDetails, { item: item });
  }

  delete(item, idx) {
    this.service.delete(item)
      .catch(console.error.bind(console));
    this.items.splice(idx, 1);
  }

  getItems(event) {
    this.items = this.itemsBackup;
    var val = event.target.value;

    if (val && val.trim() != '') {
      this.items = this.items.filter((item) => {
        return ((item.firstName + ' ' + item.lastName).toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }

}
