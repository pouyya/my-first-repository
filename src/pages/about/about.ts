import { Component } from '@angular/core';
import { BackOfficeModule } from '../../modules/backOfficeModule';
import { PageModule } from '../../metadata/pageModule';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';
import { ConfigService } from '../../modules/dataSync/services/configService';
import { SyncContext } from "../../services/SyncContext";
import { Pro } from '@ionic/pro';

@SecurityModule(SecurityAccessRightRepo.AboutPage)
@PageModule(() => BackOfficeModule)
@Component({
  selector: 'about-page',
  templateUrl: 'about.html'
})

export class AboutPage {

  public dbInternalName: string;
  public dbExternalName: string;
  public dbInternalName_Critical: string;
  public dbExternalName_Critical: string;
  public dbServerURL: string;
  public dbServerURL_Critical: string;
  public serverBaseURL: string;
  public snapshotInfo: ISnapshotInfo;
  public envName: string;

  constructor(
    public syncContext: SyncContext
  ) {
  }

  async ionViewDidLoad() {
    this.dbInternalName = ConfigService.internalDBName;
    this.dbExternalName = ConfigService.externalDBName;
    this.dbInternalName_Critical = ConfigService.internalCriticalDBName;
    this.dbExternalName_Critical = ConfigService.externalCriticalDBName;
    this.dbServerURL = ConfigService.currentFullExternalDBUrl;
    this.dbServerURL_Critical = ConfigService.currentCriticalFullExternalDBUrl;
    this.serverBaseURL = ConfigService.securityServerBaseUrl();
    this.snapshotInfo = await Pro.deploy.getCurrentVersion();
    this.envName = ConfigService.envName();
  }
}