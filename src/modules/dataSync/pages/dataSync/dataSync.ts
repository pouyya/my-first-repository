import { Sales } from './../../../../pages/sales/sales';
import { DBEvent } from '@simpleidea/simplepos-core/dist/db/dbEvent';
import { DBService } from '@simpleidea/simplepos-core/dist/services/dBService';
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { UserService } from '../../services/userService';
import { ConfigService } from '../../services/configService';
import { DataSyncModule } from '../../dataSyncModule';

@Component({
    selector: 'datasync',
    templateUrl: 'dataSync.html'
})
export class DataSync {

    public updateText: String = '';
    private isNavigated = false;

    constructor(private userService: UserService,
        private navCtrl: NavController) {
    }

    async ionViewDidLoad() {
        let user = await this.userService.getDeviceUser();

       
        ConfigService.externalDBUrl = user.settings.db_url;

        ConfigService.externalCriticalDBName = user.settings.db_critical_name;
        ConfigService.internalCriticalDBName = user.settings.db_critical_local_name;

        ConfigService.externalDBName = user.settings.db_name;
        ConfigService.internalDBName = user.settings.db_local_name;

        this.updateText = "Check for data update!";

        DBService.initializePlugin(ConfigService.isDevelopment());
        DBService.initialize(ConfigService.currentCriticalFullExternalDBUrl, ConfigService.internalCriticalDBName, ConfigService.currentFullExternalDBUrl, ConfigService.internalDBName);

        DBService.criticalDBSyncProgress.subscribe(
            async (data: DBEvent) => {
                if (data) {
                    if (data.progress === 1 && !this.isNavigated) {
                        this.updateText = "Loading your company data 100%";
                        // await loadStoreData()
                        this.isNavigated = true;
                        this.navCtrl.setRoot(Sales);
                    }
                    else {
                        this.updateText = "Loading your company data " + Math.round(data.progress * 100) + "%";
                    }
                }
            }
        );
    }
}
