import { HomePage } from './../home/home';
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Deploy } from '@ionic/cloud-angular';  

@Component({
  selector: 'page-deploy',
  templateUrl: 'deploy.html'
})
export class DeployPage {

	public updateText: String = '';

	constructor(public navCtrl: NavController, public navParams: NavParams, public deploy: Deploy) {
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
			}else{
				console.log('No new code :(');

				navCtrl.setRoot(HomePage);
			}
		});	
	}

  ionViewDidLoad() {
    console.log('ionViewDidLoad DeployPage');
  }

}