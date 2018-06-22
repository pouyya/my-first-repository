import { Component } from '@angular/core';
import { PageModule } from '../../metadata/pageModule';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';
import { HumanResourceModule } from "../../modules/humanResourceModule";

@SecurityModule(SecurityAccessRightRepo.HumanResourceDashboard)
@PageModule(() => HumanResourceModule)
@Component({
  selector: 'human-resource-dashboard',
  templateUrl: 'human-resource-dashboard.html'
})
export class HumanResourceDashboard {

}
