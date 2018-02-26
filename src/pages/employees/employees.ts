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

  protected items: Employee[] = [];
  public selectedStatus: any = 'all';
  public statusList: any = [
    { value: 'all', text: 'All' },
    { value: 'true', text: 'Active' },
    { value: 'false', text: 'In-Active' }
  ];

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
    this.filter.fullname = (val && val.trim() != '') ? val : "";
    this.limit = SearchableListing.defaultLimit;
    this.offset = SearchableListing.defaultOffset;
    this.items = [];
    await this.fetchMore();
  }

  public async searchByStatus() {
    switch (this.selectedStatus) {
      case 'all':
        delete this.options.conditionalSelectors.isActive;
        break;
      case 'true':
        this.options.conditionalSelectors.isActive = true;
        break;
      case 'false':
        this.options.conditionalSelectors.isActive = false;
        break;
    }
    this.limit = SearchableListing.defaultLimit;
    this.offset = SearchableListing.defaultOffset;
    this.items = [];
    await this.fetchMore();
    return;
  }

}