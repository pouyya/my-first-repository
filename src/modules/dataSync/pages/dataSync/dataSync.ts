import { DBEvent } from '@simplepos/core/dist/db/dbEvent';
import { DBService } from '@simplepos/core/dist/services/dBService';
import { Component } from '@angular/core';
import { ModalController, NavController } from 'ionic-angular';
import { UserService } from '../../services/userService';
import { ConfigService } from '../../services/configService';
import { DataBootstrapper } from '../../../../pages/data-bootstrapper/data-bootstrapper';
import { DBIndex } from '@simplepos/core/dist/db/dbIndex';
import { PlatformService } from '../../../../services/platformService';
import { AccountSettingService } from "../../services/accountSettingService";
import { Wizard } from "./modals/wizard/wizard";
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'datasync',
  templateUrl: 'dataSync.html'
})
export class DataSync {

  public updateText: String = '';
  private isNavigated = false;
  private accountSettings;

  constructor(private userService: UserService,
    private navCtrl: NavController,
    private platformService: PlatformService,
    private accountSettingsService: AccountSettingService,
    private modalCtrl: ModalController,
    private translateService: TranslateService, ) {
  }

  async ionViewDidLoad() {
    const claims = this.userService.getUserClaims();

    if (!claims) {
      throw new Error("Can't load users claims, please make sure user is logged in and IDS sent all claims");
    }

    ConfigService.externalDBUrl = claims["db_url"];

    ConfigService.externalCriticalDBName = claims["db_critical_name"];
    ConfigService.internalCriticalDBName = claims["db_critical_local_name"];

    ConfigService.externalDBName = claims["db_name"];
    ConfigService.internalDBName = claims["db_name_local"];

    ConfigService.externalAuditDBName = claims["db_audit_name"];
    ConfigService.internalAuditDBName = claims["db_audit_local_name"];

    this.updateText = "Check for data update!";

    DBService.pouchDBProvider.initializePlugin(ConfigService.isDevelopment(), this.platformService.isMobileDevice());
    DBService.pouchDBProvider.initialize(
      this.platformService.isMobileDevice(),
      ConfigService.currentCriticalFullExternalDBUrl,
      ConfigService.internalCriticalDBName,
      ConfigService.currentFullExternalDBUrl,
      ConfigService.internalDBName,
      ConfigService.currentAuditDBUrl,
      ConfigService.internalAuditDBName,
      this.userService.getAccessToken(),
      [
        <DBIndex>{ name: 'orderEntityTypeName', fields: ['order', 'entityTypeName', 'entityTypeNames'] },
        <DBIndex>{ name: 'orderNameEntityTypeName', fields: ['order', 'name', 'entityTypeName', 'entityTypeNames'] }],
      [<DBIndex>{ name: 'entityTypeName', fields: ['entityTypeName', 'entityTypeNames'] }],
      [<DBIndex>{ name: 'entityTypeName', fields: ['entityTypeName', 'entityTypeNames'] }]);

    DBService.pouchDBProvider.criticalDBSyncProgress.subscribe(
      async (data: DBEvent) => {
        if (data) {
          if (data.progress === 1 && !this.isNavigated) {
            this.updateText = "Loading your company data 100%";
            this.isNavigated = true;
            this.accountSettings = await this.accountSettingsService.getCurrentSetting();
            this.translateService.setDefaultLang('au');
            this.translateService.use('au');

            if (this.accountSettings && this.accountSettings.isInitialized) {
              this.navCtrl.setRoot(DataBootstrapper)
            } else {
              this.showWizardModal()
            }
          }
          else {
            this.updateText = "Loading your company data " + Math.round(data.progress * 100) + "%";
          }
        }
      }
    );
  }

  private async showWizardModal() {
    const user = await this.userService.getUser(false);
    let modal = this.modalCtrl.create(Wizard, { currentStore: user.currentStore }, { enableBackdropDismiss: false });
    modal.onDidDismiss(async data => {
      if (!data || !data.status) {
        return;
      }

      this.navCtrl.setRoot(DataBootstrapper, { afterSetupLogin: true })
    });
    modal.present();
  }
}
