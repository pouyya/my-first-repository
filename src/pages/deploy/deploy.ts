import { PluginService } from './../../services/pluginService';
import { Sales } from './../sales/sales';
import { UserService } from './../../services/userService';
import { AppSettings } from './../../model/appSettings';
import { AppSettingsService } from './../../services/appSettingsService';
import { HomePage } from './../home/home';
import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { Deploy } from '@ionic/cloud-angular';

@Component({
	selector: 'page-deploy',
	templateUrl: 'deploy.html'
})
export class DeployPage {

	public updateText: String = '';

	constructor(
		private userService: UserService,
		private pluginService: PluginService,
		public navCtrl: NavController,
		public navParams: NavParams,
		public platform: Platform,
		public deploy: Deploy,
	) {

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

	ionViewDidLoad() {
		console.log('ionViewDidLoad DeployPage');
	}

	async loadUserInfoAndNavigateToHome() {
		var user = await this.userService.getUser();
		this.navCtrl.setRoot(Sales);
		return user;
	}
}