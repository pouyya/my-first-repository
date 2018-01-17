import { SecurityAccessRightRepo } from './../../model/securityAccessRightRepo';
import { Component } from '@angular/core';
import { BackOfficeModule } from '../../modules/backOfficeModule';
import { PageModule } from '../../metadata/pageModule';
import { SecurityModule } from '../../infra/security/securityModule';

@SecurityModule(
  SecurityAccessRightRepo.EmployeeAddEdit, 
  SecurityAccessRightRepo.EmployeeListing
)
@PageModule(() => BackOfficeModule)
@Component({
  selector: 'app-home',
  templateUrl: 'home.html'
})
export class HomePage {

}
