import _ from 'lodash';
import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { Deploy } from '@ionic/cloud-angular';
import { Store } from './../../model/store';
import { POS } from './../../model/pos';
import { SharedService } from './../../services/_sharedService';
import { StoreService } from './../../services/storeService';
import { PosService } from './../../services/posService';
import { ConfigService } from './../../services/configService';
import { PluginService } from './../../services/pluginService';
import { Sales } from './../sales/sales';
import { UserService } from './../../services/userService';
import { DBService } from '../../services/DBService';

@Component({
  selector: 'page-deploy',
  templateUrl: 'deploy.html'
})
export class DeployPage {

  public updateText: String = '';
  private isNavigated = false;

  constructor(private userService: UserService,
              private pluginService: PluginService,
              private posService: PosService,
              private storeService: StoreService,
              private _sharedService: SharedService,
              public navCtrl: NavController,
              public navParams: NavParams,
              public platform: Platform,
              public deploy: Deploy) {

    if (platform.is('core')) {
      this.loadUserInfoAndNavigateToHome().catch(error => {
        this.pluginService.openDialoge("An error has occurred.").catch(error => {
          throw new Error(error);
        })
      });
    }
    else {
      this.deploy.channel = 'dev';
      this.deploy.check().then((snapshotAvailable: boolean) => {
        if (snapshotAvailable) {
          this.updateText = 'Grabbing the best experience for you';
          console.log('There\'s an update!');
          this.deploy.download().then(() => {
            this.updateText = 'Updating...';

            return this.deploy.extract();
          }).then(() => {
            this.deploy.load();
          });
        } else {
          console.log('No new code :(');
          this.loadUserInfoAndNavigateToHome();
        }
      });
    }
  }

  async loadUserInfoAndNavigateToHome() {
    let user = await this.userService.getUser();

    let loadStoreData = async () => {
      try {
        let currentPos: POS;
        let currentStore: Store;
        if (!user.currentPos || !user.currentStore) {
          let allPos: POS[] = await this.posService.getAll();
          currentPos = _.head(allPos);
          currentStore = await this.storeService.get(currentPos.storeId);
          user.currentPos = currentPos._id;
          user.currentStore = currentStore._id;
          this._sharedService.publish({ currentStore, currentPos });
          this.userService.setSession(user);
          return;
        } else {
          let user = this.userService.getLoggedInUser();
          currentPos = await this.posService.get(user.currentPos);
          currentStore = await this.storeService.get(user.currentStore);
          this._sharedService.publish({ currentStore, currentPos });
          return await Promise.resolve();
        }
      } catch (err) {
        throw new Error(err);
      }
    };

    ConfigService.externalDBUrl = user.settings.db_url;
    ConfigService.externalDBName = user.settings.db_name;
    ConfigService.internalDBName = user.settings.db_local_name;
    this.updateText = "Check for data update!";
    DBService.dbSyncProgress.subscribe(
      data => {
        if (data === 1 && !this.isNavigated) {
          this.updateText = "Loading your company data 100%";
          loadStoreData().then(() => {
            this.isNavigated = true;
            this.navCtrl.setRoot(Sales);
          });
        }
        else {
          this.updateText = "Loading your company data " + Math.round(data * 100) + "%";
        }
      }
    );
    await DBService.initialize();
  }
}