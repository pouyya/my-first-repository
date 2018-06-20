import { Component, NgZone } from '@angular/core';
import { NavController } from 'ionic-angular';
import { IonicProDeployService } from 'ionicpro-deploy';
import { DeployService } from '../../services/deployService';

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
    private deployService: DeployService) {
  }

  async ionViewDidLoad() {
    try {

      this.progressMessage = 'Checking for new version.';

      if (await this.ionicProDeployService.check() === true) {

        this.progressMessage = 'New version available.';

        this.ionicProDeployService.update(true).subscribe(async updateProgress => {
          this.zone.run(() => this.progressMessage = `${updateProgress.step} ${updateProgress.percent}%`);
        }, async error => {
          console.error('error in downloading new version');
          await this.navCtrl.setRoot(await this.deployService.getNextPageAfterDeploy());
        });
      }
      else {
        await this.navCtrl.setRoot(await this.deployService.getNextPageAfterDeploy());
      }
    } catch (error) {
      await this.navCtrl.setRoot(await this.deployService.getNextPageAfterDeploy());
    }
  }
}
