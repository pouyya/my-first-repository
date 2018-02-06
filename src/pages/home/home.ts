import { Component } from '@angular/core';
import { BackOfficeModule } from '../../modules/backOfficeModule';
import { PageModule } from '../../metadata/pageModule';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';

@SecurityModule(SecurityAccessRightRepo.BackOfficeDashboard)
@PageModule(() => BackOfficeModule)
@Component({
  selector: 'app-home',
  templateUrl: 'home.html'
})
export class HomePage {

}
