import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Deploy } from '@ionic/cloud-angular';
import { ConfigService } from './../../services/configService';
import { UserService } from './../../services/userService';
import { PlatformService } from '../../services/platformService';
import { DataSync } from '../dataSync/dataSync';
import { LoginPage } from '../login/login';

@Component({
  selector: 'page-deploy',
  templateUrl: 'deploy.html'
})
export class DeployPage {

  public updateText: String = '';

  constructor(private userService: UserService,
    public navCtrl: NavController,
    public platformService: PlatformService,
    public deploy: Deploy) { }

  async ionViewDidLoad() {
    if (this.platformService.isMobileDevice() && !ConfigService.turnOffDeployment) {
      this.deploy.channel = 'dev';
      var snapshotAvailable = await this.deploy.check();
      if (snapshotAvailable) {
        this.updateText = 'Grabbing the best experience for you';
        console.log('There\'s an update!');
        await this.deploy.download();
        this.updateText = 'Updating...';
        await this.deploy.extract();
        await this.deploy.load();
      }
      else {
        this.navigateToNextStep();
      }
    }
    else {
      this.navigateToNextStep();
    }
  }

  private async navigateToNextStep() {
    var user = await this.userService.getUser();
    this.navCtrl.setRoot(user ? DataSync : LoginPage);
  }
}