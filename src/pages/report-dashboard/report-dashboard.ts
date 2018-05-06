import { Component } from '@angular/core';
import { ReportModule } from '../../modules/reportModule';
import { PageModule } from '../../metadata/pageModule';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';

@SecurityModule(SecurityAccessRightRepo.ReportsDashboard)
@PageModule(() => ReportModule)
@Component({
  selector: 'report-dashboard',
  templateUrl: 'report-dashboard.html'
})
export class ReportsDashboard {

}
