import { ForgotPassword } from './modals/forgot-password/forgot-password';
import { ModalController, NavController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { Component } from '@angular/core';
import { RegisterPage } from '../register/register';
import { AuthService } from '../../services/authService';
import { DataSync } from '../dataSync/dataSync';
import { BoostraperModule } from '../../../bootstraperModule';
import { PageModule } from '../../../../metadata/pageModule';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { ENV } from '@app/env';

@PageModule(() => BoostraperModule)
@Component({
  selector: 'login',
  templateUrl: 'login.html'
})
export class LoginPage {

  public email: string;
  public password: string;

  constructor(
    private loading: LoadingController,
    public navCtrl: NavController,
    private authService: AuthService,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController,
    private iab: InAppBrowser) { }

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
    const browser = this.iab.create(`${ENV.service.baseUrl}/registration-form/`, '_blank', 'location=no,clearcache=yes,clearsessioncache=yes,useWideViewPort=yes');
    var token;
    var tokenInterval;

    browser.on('loadstop').subscribe(event => {
      tokenInterval = setInterval(async function () {
        var tokenElement = await browser.executeScript({ code: "document.getElementsByName('token')" });
        if (tokenElement && tokenElement[0] && tokenElement[0].value) {
          token = tokenElement[0].value;
          browser.close();
        }
      }, 100)
    });

    browser.on('exit').subscribe(async function () {
      clearInterval(tokenInterval);

      let loader = this.loading.create({
        content: 'Logging In...'
      });

      await loader.present();

      this.authService.getUserProfile(token).subscribe(
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
    });
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