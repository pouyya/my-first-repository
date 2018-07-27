import { DBEvent } from '@simpleidea/simplepos-core/dist/db/dbEvent';
import { DBService } from '@simpleidea/simplepos-core/dist/services/dBService';
import { Component } from '@angular/core';
import { ModalController, NavController } from 'ionic-angular';
import { UserService } from '../../services/userService';
import { ConfigService } from '../../services/configService';
import { DataBootstrapper } from '../../../../pages/data-bootstrapper/data-bootstrapper';
import { DBIndex } from '@simpleidea/simplepos-core/dist/db/dbIndex';
import { PlatformService } from '../../../../services/platformService';
import { AccountSettingService } from "../../services/accountSettingService";
import { Wizard } from "./modals/wizard/wizard";
import {StoreService} from "../../../../services/storeService";

@Component({
	selector: 'datasync',
	templateUrl: 'dataSync.html'
})
export class DataSync {

	public updateText: String = '';
	private isNavigated = false;
	private user;
	private accountSettings;
	constructor(private userService: UserService,
		private navCtrl: NavController,
		private platformService: PlatformService,
		private accountSettingsService: AccountSettingService,
        private modalCtrl: ModalController,
        private storeService: StoreService) {
	}

	async ionViewDidLoad() {
		this.user = await this.userService.getDeviceUser();

		ConfigService.externalDBUrl = this.user.settings.db_url;

		ConfigService.externalCriticalDBName = this.user.settings.db_critical_name;
		ConfigService.internalCriticalDBName = this.user.settings.db_critical_local_name;

		ConfigService.externalDBName = this.user.settings.db_name;
		ConfigService.internalDBName = this.user.settings.db_local_name;

		ConfigService.externalAuditDBName = this.user.settings.db_audit_name;
		ConfigService.internalAuditDBName = this.user.settings.db_audit_local_name;

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
            this.user.access_token,
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
                        this.accountSettings.isInitialized ? this.navCtrl.setRoot(DataBootstrapper): this.showWizardModal();
					}
					else {
						this.updateText = "Loading your company data " + Math.round(data.progress * 100) + "%";
					}
				}
			}
		);
	}

	private showWizardModal(){
        let modal = this.modalCtrl.create(Wizard);
        modal.onDidDismiss(async data => {
        	if(!data || !data.status){
        		return;
			}
        	let currentStore;
        	if(!this.user.currentStore){
                let allStores =  await this.storeService.getAll();
                currentStore = allStores[0];
			}else{
                currentStore = await this.storeService.get(this.user.currentStore);
			}

            currentStore.taxFileNumber = data.taxFileNumber;
            currentStore.phone = data.phoneNumber;
            currentStore.address = data.address;
            currentStore.twitter = data.socialName || "";
            // currentStore.pin = data.adminPin;
            this.accountSettings.isInitialized = true;
			await this.storeService.update(currentStore);
			await this.accountSettingsService.update(this.accountSettings);
            this.navCtrl.setRoot(DataBootstrapper)
        });
        modal.present();
	}
}
