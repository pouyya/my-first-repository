import { SearchableListing } from './../../modules/searchableListing';
import { EmployeeDetails } from './../employee-details/employee-details';
import { EmployeeService } from './../../services/employeeService';
import { Component, NgZone } from '@angular/core';
import { Employee } from "../../model/employee";
import { NavController, LoadingController } from 'ionic-angular';
import { PageModule } from '../../metadata/pageModule';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';
import { FilterType, Item } from "../../metadata/listingModule";
import {EmployeeTimestampService} from "../../services/employeeTimestampService";
import {Utilities} from "../../utility";
import { HumanResourceModule } from "../../modules/humanResourceModule";

@SecurityModule(SecurityAccessRightRepo.EmployeeListing)
@PageModule(() => HumanResourceModule)
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
    private loading: LoadingController,
    private timestampService: EmployeeTimestampService,
    private utility: Utilities
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

  public async remove(employee: Employee, index: number){
      try {
          const deleteItem = await this.utility.confirmRemoveItem("Do you really want to delete this employee!");
          if(!deleteItem){
              return;
          }
          await super.remove(employee, index);
      } catch (err) {
          throw new Error(err);
      }
  }

}