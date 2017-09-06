import { ToastController } from 'ionic-angular';
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
    private nav: Nav
  ) { }

  public login() {
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
}