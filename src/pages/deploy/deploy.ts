import { Component, NgZone } from '@angular/core';
import { NavController } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { DataSync } from '../dataSync/dataSync';
import { PlatformService } from '../../services/platformService';
import { Insomnia } from '@ionic-native/insomnia';
import { UserService } from '../../services/userService';
import { ConfigService } from '../../services/configService';
import { IonicProDeployService } from '../../modules/ionicpro-deploy/ionic-pro-deploy.service';
import { SplashScreen } from '@ionic-native/splash-screen';

@Component({
  selector: 'page-deploy',
  templateUrl: 'deploy.html',
})
export class DeployPage {

  public progressMessage: string = "";

  constructor(
    private navCtrl: NavController,
    private userService: UserService,
    private platformService: PlatformService,
    private insomnia: Insomnia,
    private ionicProDeployService: IonicProDeployService,
    private zone: NgZone,
    public splashScreen: SplashScreen) {
  }

  async ngOnInit() {
    if (!this.eligibleForDeploy()) {
      await this.navigateToNextPage();
    }
  }

  async ionViewDidLoad() {
    try {

      this.progressMessage = 'Checking for new version.';

      if (await this.ionicProDeployService.check() === true) {

        this.progressMessage = 'New version available.';

        this.ionicProDeployService.download().subscribe(async downloadProgress => {

          this.zone.run(() => {

            this.progressMessage = `Download New version ${downloadProgress}%`;
          });
        }, async error => {
          await this.navigateToNextPage();
        }, () => {
          //download completed 
          this.progressMessage = 'Download new version done.';

          this.progressMessage = 'Extract new version started.';

          this.ionicProDeployService.extract().subscribe(async extractProgress => {

            this.zone.run(async () => {
              this.progressMessage = `Extract new version ${extractProgress}%`;
            });
          }, async error => {
            await this.navigateToNextPage();
          }, async () => {
            //extract completed
            this.progressMessage = 'Extract new version done.';

            this.splashScreen.show();
            await this.ionicProDeployService.redirect();
          });
        })
      }
      else {
        await this.navigateToNextPage();
      }
    } catch (error) {
      await this.navigateToNextPage();
    }
  }

  private eligibleForDeploy() {
    return this.platformService.isMobileDevice() && !ConfigService.isDevelopment() && ConfigService.turnOnDeployment();
  }

  private async navigateToNextPage() {
    let user = await this.userService.getDeviceUser();
    if (this.platformService.isMobileDevice()) {
      user && user.settings && user.settings.screenAwake === false ? this.insomnia.allowSleepAgain() : this.insomnia.keepAwake();
    }
    this.navCtrl.setRoot(user ? DataSync : LoginPage);
  }
}
