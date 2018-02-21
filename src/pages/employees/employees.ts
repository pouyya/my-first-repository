import { EmployeeDetails } from './../employee-details/employee-details';
import { EmployeeService } from './../../services/employeeService';
import { Component, NgZone } from '@angular/core';
import { Employee } from "../../model/employee";
import { NavController, AlertController, Platform, LoadingController } from 'ionic-angular';
import { BackOfficeModule } from '../../modules/backOfficeModule';
import { PageModule } from '../../metadata/pageModule';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';

@SecurityModule(SecurityAccessRightRepo.EmployeeListing)
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
    private loading: LoadingController,
    private zone: NgZone) {
  }

  async ionViewDidEnter() {
    let loader = this.loading.create({ content: 'Loading Services...' });
    await loader.present();
    this.items = await this.service.getAll();
    this.itemsBackup = this.items;
  }

  public showDetail(item) {
    this.navCtrl.push(EmployeeDetails, { item: item });
  }

  public async remove (employee: Employee, index) {
    try {
      await this.service.delete(employee);
      this.items.splice(index, 1);
    } catch (err) {
      return Promise.reject(err);
    }
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
