import { Component, NgZone } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { DeployService } from '../../services/deployService';
import { Pro } from "@ionic/pro";
import { ConfigService } from '../../modules/dataSync/services/configService';
import {ErrorLoggingService} from "../../services/ErrorLoggingService";

@Component({
  selector: 'page-deploy',
  templateUrl: 'deploy.html',
})
export class DeployPage {

  public progressMessage: string = "";

  constructor(
    private navCtrl: NavController,
    private zone: NgZone,
    public splashScreen: SplashScreen,
    private deployService: DeployService,
    private errorLoggingService: ErrorLoggingService) {
  }

  async ionViewDidLoad() {
    try {

      this.progressMessage = 'Checking for new version.';

      const config = {
        'appId': ConfigService.ionicDeployAppId(),
        'channel': ConfigService.ionicDeployAppChannel()
      }

      await Pro.deploy.configure(config);

      const update = await Pro.deploy.checkForUpdate()

      if (update && update.available) {

        this.progressMessage = 'New version available!';

        await Pro.deploy.downloadUpdate((progress) => {
          this.zone.run(() => this.progressMessage = `Download New version ${progress}%`);
        });

        this.progressMessage = 'Extract new version started.';

        await Pro.deploy.extractUpdate((progress) => {
          this.zone.run(async () => this.progressMessage = `Extract new version ${progress}%`);
        });

        this.splashScreen.show();
        await Pro.deploy.reloadApp();
      }
      else {
        await this.navCtrl.setRoot(await this.deployService.getNextPageAfterDeploy());
      }
    } catch (error) {
      this.errorLoggingService.exception(error);
      await this.navCtrl.setRoot(await this.deployService.getNextPageAfterDeploy());
    }
  }
}