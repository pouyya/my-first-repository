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

@Component({
  selector: 'login',
  templateUrl: 'login.html',
  styleUrls: ['/pages/login/login.scss'],
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

    this.authService.login(this.email, this.password).subscribe(
      async data => {
        await this.navigateToDataSync();
        loader.dismiss();
      },
      error => {
        let toast = this.toastCtrl.create({
          message: 'Invalid Email/Password!',
          duration: 3000
        });
        toast.present();
        loader.dismiss();
      });
  }

  public register(): void {
    this.iab.create('https://google.com.pk/');
  }

  public forgotPassword(): void {
    let modal = this.modalCtrl.create(ForgotPassword);
    modal.onDidDismiss(data => {
    });
    modal.present();
  }

  navigateToDataSync() {
    return this.navCtrl.setRoot(DataSync);
  }
}