import { Component } from '@angular/core';
import { ReportModule } from '../../modules/reportModule';
import { PageModule } from '../../metadata/pageModule';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { UserService } from '../../modules/dataSync/services/userService';

interface StockMovement {
  productName: string,
  startStock: number,
  received: number,
  sold: number,
  deducted: number,
  endStock: number,
  returned: number
}

@SecurityModule(SecurityAccessRightRepo.ReportStockMovementSummary)
@PageModule(() => ReportModule)
@Component({
  selector: 'report-stock-movement-summary',
  templateUrl: 'report-stock-movement-summary.html',
  styleUrls: ['/components/pages/report-stock-movement-summary.scss']
})
export class ReportStockMovementSummaryPage {

  public url = 'http://mrmohamadi.com/reports/report5.php';
  public token = '';

  constructor(
    private theInAppBrowser: InAppBrowser,
    private userService: UserService
  ) {}

  public async openBrowser(target: string) {
    if (this.token == '') {
      this.url += '?';
      this.token = await this.userService.getUserToken();
      this.url += this.token;
    }

    this.theInAppBrowser.create(this.url, target);
  }
}
