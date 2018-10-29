import { NavController, LoadingController, ToastController } from 'ionic-angular';
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

  constructor(
    private loading: LoadingController,
    public navCtrl: NavController,
    private authService: AuthService,
    private toastCtrl: ToastController,
    private iab: InAppBrowser,
    private userService: UserService) {
  }

  public async login(): Promise<any> {

    let loader = this.loading.create({
      content: 'Logging In...'
    });

    await loader.present();

    try {
      const success = await this.idsLogin();
      const keyValuePair = `#id_token=${encodeURIComponent(success.id_token)}&access_token=${encodeURIComponent(success.access_token)}`;
      await this.authService.tryLogin({
        customHashFragment: keyValuePair,
        disableOAuth2StateCheck: true
      });
      await this.userService.loadUserProfile();
      if (this.userService.ensureRequiredClaims()) {
        await this.userService.initializeUserProfile();
        await this.navigateToDataSync();
      } else {
        this.authService.logout();
        this.showMessage("The minimum requirement is not available for your account. Please contact support.");
      }
    }
    catch (error) {
      var message = (error && error.status === 0) ? 'There is no internet connection pleas check your internet connection!' : 'Invalid Email/Password!';
      this.showMessage(message);
    }
    finally {
      loader.dismiss();
    }
  }

  idsLogin(): Promise<any> {

    return new Promise((resolve, reject) => {

      return this.authService.createAndSaveNonce().then(nonce => {
        let state: string = Math.floor(Math.random() * 1000000000).toString();
        if (window.crypto) {
          const array = new Uint32Array(1);
          window.crypto.getRandomValues(array);
          state = array.join().toString();
        }

        this.authService.buildOAuthUrl(state, nonce).then((oauthUrl) => {

          const browser = this.iab.create(oauthUrl, '_blank', 'location=no,clearcache=yes,clearsessioncache=yes,useWideViewPort=yes');

          browser.on('loadstart').subscribe((event) => {
            if ((event.url).indexOf('http://localhost:8100') === 0) {
              browser.on('exit').subscribe(() => { });
              browser.close();
              const responseParameters = ((event.url).split('#')[1]).split('&');
              const parsedResponse = {};
              for (let i = 0; i < responseParameters.length; i++) {
                parsedResponse[responseParameters[i].split('=')[0]] =
                  responseParameters[i].split('=')[1];
              }
              const defaultError = 'Problem authenticating with SimplePOS IDS';
              if (parsedResponse['state'] !== state) {
                reject(defaultError);
              } else if (parsedResponse['access_token'] !== undefined &&
                parsedResponse['access_token'] !== null) {
                resolve(parsedResponse);
              } else {
                reject(defaultError);
              }
            }
          });
          browser.on('exit').subscribe(function (event) {
            reject('The SimplePOS IDS sign in flow was canceled');
          });
        });
      });
    });
  }

  private showMessage(message: string) {
    let toast = this.toastCtrl.create({
      message,
      duration: 3000
    });
    toast.present();
  }

  async getValue(browser: InAppBrowserObject, key: string) {
    var currentValue = await browser.executeScript({ code: `(function() { var currentValue = document.getElementsByName('${key}'); if(currentValue && currentValue[0] && currentValue[0].value) return currentValue[0].value; })()` });
    if (currentValue && currentValue[0]) {
      return currentValue[0];
    }
    return null;
  }

  public forgotPassword(): void {
    const browser = this.iab.create(`${ConfigService.securityServerBaseUrl()}/forgottenpassword?ismobile=true`, '_blank', 'location=no,clearcache=yes,clearsessioncache=yes,useWideViewPort=yes');
    var bridgeInterval;

    var _this = this;

    browser.on('loadstop').subscribe(function () {
      bridgeInterval = setInterval(async function () {

        var closeResult = await _this.getValue(browser, 'forcetoclose');
        if (closeResult && closeResult[0]) {
          setTimeout(function () {
            browser.close();
          }, 8000);
        }
      }, 500);

    });

    browser.on('exit').subscribe(function () {
      clearInterval(bridgeInterval);
    });
  }

  navigateToDataSync() {
    return this.navCtrl.setRoot(DataSync);
  }
}