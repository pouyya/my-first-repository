import { DateTimeService } from './../../services/dateTimeService';
import { AccountSettingService } from './../../services/accountSettingService';
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { UserService } from '../../services/userService';
import { PluginService } from '../../services/pluginService';
import { PosService } from '../../services/posService';
import { StoreService } from '../../services/storeService';
import { SharedService } from '../../services/_sharedService';
import { ConfigService } from '../../services/configService';
import { DBService } from '../../services/DBService';
import { Sales } from '../sales/sales';
import { POS } from '../../model/pos';
import { Store } from '../../model/store';
import * as _ from 'lodash';

@Component({
    selector: 'datasync',
    templateUrl: 'datasync.html'
})
export class DataSync {

    public updateText: String = '';
    private isNavigated = false;

    constructor(private userService: UserService,
        private pluginService: PluginService,
        private posService: PosService,
        private storeService: StoreService,
        private _sharedService: SharedService,
        private accountSettingService: AccountSettingService,
        private dateTimeService: DateTimeService,
        private navCtrl: NavController) {
    }

    async ionViewDidLoad() {
        let user = await this.userService.getDeviceUser();

        let loadStoreData = async () => {
            let currentPos: POS;
            let currentStore: Store;
            let accountSettings = await this.accountSettingService.getCurrentSetting()
            this.dateTimeService.timezone = accountSettings.timeOffset || null;
            if (!user.currentPos || !user.currentStore) {
                let allPos: POS[] = await this.posService.getAll();
                currentPos = _.head(allPos);
                currentStore = await this.storeService.get(currentPos.storeId);
                user.currentPos = currentPos._id;
                user.currentStore = currentStore._id;
                this._sharedService.publish({ currentStore, currentPos });
                this.userService.setSession(user);
            } else {
                currentPos = await this.posService.get(user.currentPos);
                currentStore = await this.storeService.get(user.currentStore);
            }

            this._sharedService.publish({ currentStore, currentPos });
        };

        ConfigService.externalDBUrl = user.settings.db_url;

        ConfigService.externalCriticalDBName = user.settings.db_critical_name;
        ConfigService.internalCriticalDBName = user.settings.db_critical_local_name;
        
        ConfigService.externalDBName = user.settings.db_name;
        ConfigService.internalDBName = user.settings.db_local_name;


        this.updateText = "Check for data update!";

        DBService.initializePlugin();
        DBService.initialize();

        DBService.criticalDBSyncProgress.subscribe(
            async data => {
                if (data === 1 && !this.isNavigated) {
                    this.updateText = "Loading your company data 100%";
                    await loadStoreData()
                    this.isNavigated = true;
                    this.navCtrl.setRoot(Sales);
                }
                else {
                    this.updateText = "Loading your company data " + Math.round(data * 100) + "%";
                }
            }
        );
    }
}
