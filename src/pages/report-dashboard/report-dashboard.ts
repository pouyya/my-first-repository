import { Component } from '@angular/core';
import { ReportModule } from '../../modules/reportModule';
import { PageModule } from '../../metadata/pageModule';

@PageModule(() => ReportModule)
@Component({
  selector: 'report-dashboard',
  templateUrl: 'report-dashboard.html'
})
export class ReportsDashboard {

}
