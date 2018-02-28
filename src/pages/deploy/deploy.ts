import { Component, NgZone } from '@angular/core';
import { NavController } from 'ionic-angular';
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
    private ionicProDeployService: IonicProDeployService,
    private zone: NgZone,
    public splashScreen: SplashScreen) {
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

          console.error('error in downloading new version');
          await this.navCtrl.setRoot(await this.ionicProDeployService.getNextPageAfterDeploy());
        }, () => {
          //download completed 
          this.progressMessage = 'Download new version done.';

          this.progressMessage = 'Extract new version started.';

          this.ionicProDeployService.extract().subscribe(async extractProgress => {

            this.zone.run(async () => {
              this.progressMessage = `Extract new version ${extractProgress}%`;
            });
          }, async error => {
            await this.navCtrl.setRoot(await this.ionicProDeployService.getNextPageAfterDeploy());
          }, async () => {
            //extract completed
            this.progressMessage = 'Extract new version done.';

            this.splashScreen.show();
            await this.ionicProDeployService.redirect();
          });
        })
      }
      else {
        await this.navCtrl.setRoot(await this.ionicProDeployService.getNextPageAfterDeploy());
      }
    } catch (error) {
      await this.navCtrl.setRoot(await this.ionicProDeployService.getNextPageAfterDeploy());
    }
  }
}
