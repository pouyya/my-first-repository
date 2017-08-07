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
		public navCtrl: NavController,
		public navParams: NavParams,
		public platform: Platform,
		public deploy: Deploy,
		private appSettingsService: AppSettingsService,
		private userService: UserService) {

		if (platform.is('core')) {
			this.loadUserInfoAndNavigateToHome();
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

	loadUserInfoAndNavigateToHome() {
		this.appSettingsService.get().then((setting: AppSettings) => {
			let user = this.userService.getLoggedInUser();
			user.settings.defaultTax = setting.defaultTax;
			user.settings.taxType = setting.taxType;

			this.navCtrl.setRoot(HomePage);
		});
	}
}