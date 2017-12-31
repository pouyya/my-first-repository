import { ConfigService } from './../../services/configService';
import { StoreService } from './../../services/storeService';
import { Component } from '@angular/core';
import { PosService } from '../../services/posService';
import { BackOfficeModule } from '../../modules/backOfficeModule';
import { PageModule } from '../../metadata/pageModule';
import { PlatformService } from '../../services/platformService';
import { IonicDeployInfo } from '../../modules/ionicpro-deploy/ionic-pro-deploy.interfaces';
import { IonicProDeployService } from '../../modules/ionicpro-deploy/ionic-pro-deploy.service';

@PageModule(() => BackOfficeModule)
@Component({
  selector: 'about-page',
  templateUrl: 'about.html'
})
export class AboutPage {

  public pos: string;
  public store: string;
  public dbInternalName: string;
  public dbExternalName: string;
  public dbInternalName_Critical: string;
  public dbExternalName_Critical: string;
  public dbServerURL: string;
  public dbServerURL_Critical: string;
  public serverBaseURL: string;
  public deployInfo: IonicDeployInfo;

  /*
  1) Current POS
  2) Current Store
  3) Ionic Deploy version
  4) DB Local and external name (configservice)
  5) DB server url (configservice)
  6) IDS Url (configService)
  */

  constructor(
    private posService: PosService,
    private storeService: StoreService,
    private platformService: PlatformService,
    private ionicProDeployService: IonicProDeployService
  ) { }

  async ionViewDidLoad() {
    try {
      let promises: Promise<any>[] = [
        this.posService.getCurrentPos(),
        this.storeService.getCurrentStore()
      ];

      let result = await Promise.all(promises);

      let pos = result[0];
      let store = result[1];

      this.pos = pos.name;
      this.store = store.name;

      this.dbInternalName = ConfigService.internalDBName;
      this.dbExternalName = ConfigService.externalDBName;
      this.dbInternalName_Critical = ConfigService.internalCriticalDBName;
      this.dbExternalName_Critical = ConfigService.externalCriticalDBName;
      this.dbServerURL = ConfigService.currentFullExternalDBUrl;
      this.dbServerURL_Critical = ConfigService.currentCriticalFullExternalDBUrl;
      this.serverBaseURL = ConfigService.securityServerBaseUrl();
      this.deployInfo = this.ionicProDeployService.currentInfo;

      return;
    } catch (e) {
      throw new Error(e);
    }
  }

}