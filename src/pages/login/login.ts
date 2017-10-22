import { DeployPage } from './../deploy/deploy';
import { AuthHttp } from 'angular2-jwt';
import { ForgotPassword } from './modals/forgot-password/forgot-password';
import { ModalController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { LoadingController, Nav } from 'ionic-angular';
import { Component } from '@angular/core';
import { AuthService } from './../../services/authService';

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
    private authService: AuthService,
    private toastCtrl: ToastController,
    private iab: InAppBrowser,
    private modalCtrl: ModalController,
    private nav: Nav,
    private authHttp: AuthHttp
  ) {
  }

  public async login(): Promise<any> {

    let loader = this.loading.create({
      content: 'Logging In...'
    });

    await loader.present();
    
    this.authService.login(this.email, this.password).subscribe(
      data => {
        this.nav.setRoot(DeployPage);
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
}