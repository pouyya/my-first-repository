import { SearchableListing } from './../../modules/searchableListing';
import { EmployeeDetails } from './../employee-details/employee-details';
import { EmployeeService } from './../../services/employeeService';
import { Component, NgZone } from '@angular/core';
import { Employee } from "../../model/employee";
import { NavController, LoadingController } from 'ionic-angular';
import { BackOfficeModule } from '../../modules/backOfficeModule';
import { PageModule } from '../../metadata/pageModule';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';
import { FilterType, Item } from "../../metadata/listingModule";

@SecurityModule(SecurityAccessRightRepo.EmployeeListing)
@PageModule(() => BackOfficeModule)
@Component({
  selector: 'employees',
  templateUrl: 'employees.html',
})
export class Employees extends SearchableListing<Employee> {

  protected items: Employee[] = [];
  public statusList: any = [
    { value: '', text: 'All' },
    { value: 'true', text: 'Active' },
    { value: 'false', text: 'In-Active' }
  ];

  constructor(public navCtrl: NavController,
    protected service: EmployeeService,
    protected zone: NgZone,
    private loading: LoadingController
  ) {
    super(service, zone, 'Employee');
  }

  async ionViewDidEnter() {
    let loader = this.loading.create({ content: 'Loading Employees...' });
    await loader.present();
    this.models['isActive'] = true;
    this.filterList(<Item>{type : FilterType.Boolean, variableName : 'isActive'}, this.models['isActive']);
    loader.dismiss();
  }

  public showDetail(item) {
    this.navCtrl.push(EmployeeDetails, { item: item });
  }


}