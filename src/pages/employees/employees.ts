import { SearchableListing } from './../../modules/searchableListing';
import { EmployeeDetails } from './../employee-details/employee-details';
import { EmployeeService } from './../../services/employeeService';
import { Component, NgZone } from '@angular/core';
import { Employee } from "../../model/employee";
import { NavController, Platform, LoadingController } from 'ionic-angular';
import { BackOfficeModule } from '../../modules/backOfficeModule';
import { PageModule } from '../../metadata/pageModule';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';

@SecurityModule(SecurityAccessRightRepo.EmployeeListing)
@PageModule(() => BackOfficeModule)
@Component({
  selector: 'employees',
  templateUrl: 'employees.html',
})
export class Employees extends SearchableListing<Employee> {

  public items: Array<Employee> = [];

  constructor(public navCtrl: NavController,
    protected service: EmployeeService,
    protected zone: NgZone,
    private platform: Platform,
    private loading: LoadingController
  ) {
    super(service, zone);
  }

  async ionViewDidEnter() {
    let loader = this.loading.create({ content: 'Loading Employees...' });
    await loader.present();
    await this.fetchMore();
    loader.dismiss();
  }

  public showDetail(item) {
    this.navCtrl.push(EmployeeDetails, { item: item });
  }

  public async remove(employee: Employee, index) {
    try {
      await this.service.delete(employee);
      this.items.splice(index, 1);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  public async searchByName(event) {
    let val = event.target.value;
    this.filter.name = (val && val.trim() != '') ? val : "";
    this.limit = this.defaultLimit;
    this.offset = this.defaultOffset;
    this.items = [];
    await this.fetchMore();
  }

}