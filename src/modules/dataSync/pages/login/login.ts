import { ForgotPassword } from './modals/forgot-password/forgot-password';
import { ModalController, NavController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { Component } from '@angular/core';
import { AuthService } from '../../services/authService';
import { DataSync } from '../dataSync/dataSync';
import { BoostraperModule } from '../../../bootstraperModule';
import { PageModule } from '../../../../metadata/pageModule';
import { InAppBrowser, InAppBrowserObject } from '@ionic-native/in-app-browser';
import { UserService } from '../../../../modules/dataSync/services/userService';
import { ConfigService } from '../../../../modules/dataSync/services/configService';


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
    private userService: UserService) {
  }

  public async login(): Promise<any> {

    this.userLogin(this.email, this.password);
  }

  async userLogin(email: string, password: string) {
    let loader = this.loading.create({
      content: 'Logging In...'
    });

    await loader.present();

    try {
      await this.authService.login(email, password);
      await this.userService.initializeUserProfile();
      await this.navigateToDataSync();
    } catch (error) {
      var message = (error && error.status === 0) ? 'There is no internet connection pleas check your internet connection!' : 'Invalid Email/Password!';
      let toast = this.toastCtrl.create({
        message,
        duration: 3000
      });
      toast.present();
    } finally {
      loader.dismiss();
    }
  }

  async getValue(browser: InAppBrowserObject, key: string) {
    var currentValue = await browser.executeScript({ code: `(function() { var currentValue = document.getElementsByName('${key}'); if(currentValue && currentValue[0] && currentValue[0].value) return currentValue[0].value; })()` });
    if (currentValue && currentValue[0]) {
      return currentValue[0];
    }
    return null;
  }

  public register(): void {
    const browser = this.iab.create(`${ConfigService.securityServerBaseUrl()}/register?mobile=1`, '_blank', 'location=no,clearcache=yes,clearsessioncache=yes,useWideViewPort=yes');
    var email;
    var password;
    var bridgeInterval;

    var _this = this;

    browser.on('loadstop').subscribe(function () {
      bridgeInterval = setInterval(async function () {
        var isRegistered = await _this.getValue(browser, 'isRegistered');
        if (isRegistered) {

          email = await _this.getValue(browser, 'email');
          password = await _this.getValue(browser, 'password');

          browser.close();
        }

        var closeResult = await _this.getValue(browser, 'forcetoclose');
        if (closeResult && closeResult[0]) {
          browser.close();
        }
      }, 500);

    });

    browser.on('exit').subscribe(function () {
      clearInterval(bridgeInterval);
      if (email && password) {
        _this.userLogin(email, password);
      }
    }.bind(this));
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