import { AuthHttp } from 'angular2-jwt';
import { ForgotPassword } from './modals/forgot-password/forgot-password';
import { ModalController, NavController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { LoadingController } from 'ionic-angular';
import { Component } from '@angular/core';
import { AuthService } from './../../services/authService';
import { UserService } from '../../services/userService';
import { PosService } from '../../services/posService';
import { SharedService } from '../../services/_sharedService';
import { StoreService } from '../../services/storeService';
import { DataSync } from '../dataSync/dataSync';
import { RegisterPage } from '../register/register';

@Component({
	selector: 'login',
	templateUrl: 'login.html',
	styleUrls: ['login.scss'],
})
export class LoginPage {

	public email: string;
	public password: string;

	constructor(
		private loading: LoadingController,
		private userService: UserService,
		private posService: PosService,
		private storeService: StoreService,
		private _sharedService: SharedService,
		public navCtrl: NavController,
		private authService: AuthService,
		private toastCtrl: ToastController,
		private iab: InAppBrowser,
		private modalCtrl: ModalController,
		private authHttp: AuthHttp
	) { }

	public async login(): Promise<any> {

		let loader = this.loading.create({
			content: 'Logging In...'
		});

		await loader.present();

		try {
			await this.authService.login(this.email, this.password);
			await this.navCtrl.setRoot(DataSync);
			loader.dismiss();
		} catch {
			let toast = this.toastCtrl.create({
				message: 'Invalid Email/Password!',
				duration: 3000
			});
			toast.present();
			loader.dismiss();
		}
	}

	public register(): void {
		this.navCtrl.push(RegisterPage)
	}

	public forgotPassword(): void {
		let modal = this.modalCtrl.create(ForgotPassword);
		modal.onDidDismiss(data => {
		});
		modal.present();
	}
}