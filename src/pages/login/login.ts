import { Headers, Http, RequestOptions } from '@angular/http';
import { HttpHeaders } from '@angular/common/http';
import { AuthHttp } from 'angular2-jwt';
import { ForgotPassword } from './modals/forgot-password/forgot-password';
import { ModalController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Sales } from './../sales/sales';
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
    private authHttp: AuthHttp,
    private http: Http
  ) {
  }

  public login(): void {
    let loader = this.loading.create({
      content: 'Logging In...'
    });

    loader.present().then(() => {
      this.authService.login(this.email, this.password).subscribe(
        data => {
          this.nav.setRoot(Sales);
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
    });
  }

  public register(): void {
    this.iab.create('https://google.com.pk/');
  }

  public testApi(): void {
    let headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');

    let options = new RequestOptions({ headers: headers });
    this.http.post('https://demo.justgreen.in/identity/connect/token',
      { "client_id": "mvc_service", "grant_type": "client_credentials", "client_secret": "secret", "scope": "sampleApi" }
      , options).subscribe(
      data => console.warn(data),
      err => console.error(err),
      () => console.warn('Request Complete'));
  }

  public forgotPassword(): void {
    let modal = this.modalCtrl.create(ForgotPassword);
    modal.onDidDismiss(data => {
    });
    modal.present();
  }
}