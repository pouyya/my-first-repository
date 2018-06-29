import { ForgotPassword } from './modals/forgot-password/forgot-password';
import { ModalController, NavController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { Component } from '@angular/core';
import { AuthService } from '../../services/authService';
import { DataSync } from '../dataSync/dataSync';
import { BoostraperModule } from '../../../bootstraperModule';
import { PageModule } from '../../../../metadata/pageModule';
import { UserService } from '../../services/userService';
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
    private iab: InAppBrowser,
    private userService: UserService) { }

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
    const browser = this.iab.create(`${ENV.service.baseUrl}/register?mobile=1`, '_blank', 'location=no,clearcache=yes,clearsessioncache=yes,useWideViewPort=yes');
    var token;
    var tokenInterval;
    var closeInterval;

    browser.on('loadstop').subscribe(event => {
      tokenInterval = setInterval(async function () {
        var tokenResult = await browser.executeScript({ code: "(function() { var token = document.getElementsByName('token'); var force-to-close = document.getElementsByName('force-to-close'); if(token && token[0] && token[0].value) return token[0].value; if(force-to-close && force-to-close[0] && force-to-close[0].value) return 1; })()" });
        if (tokenResult && tokenResult[0]) {
          if(token!=1)
            token = tokenResult[0];
          browser.close();
        }
      }, 2000);
      
    });

    var _this = this;
    browser.on('exit').subscribe(async function () {
      clearInterval(tokenInterval);

      let loader = _this.loading.create({
        content: 'Logging In...'
      });

      await loader.present();

      try {
        await _this.userService.setAccessToken(token)
        await _this.authService.getUserProfile(token);
        await _this.navigateToDataSync();
        loader.dismiss();
      } catch (error) {
        let toast = _this.toastCtrl.create({
          message: 'Invalid Email/Password!',
          duration: 3000
        });
        toast.present();
      } finally {
        loader.dismiss();
      }
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