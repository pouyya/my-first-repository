import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { AuthService } from '../../services/authService';

@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class RegisterPage {

  public firstName: string;
  public lastName: string;
  public phone: string;
  public shopName: string;
  public email: string;
  public password: string;

  constructor(private loading: LoadingController,
    private authService: AuthService,
    private toastCtrl: ToastController) {
  }

  public async login(): Promise<any> {

    let loader = this.loading.create({
      content: 'Logging In...'
    });

    await loader.present();

    try {
      await this.authService.register(this.firstName, this.lastName, this.phone
        , this.email, this.password, this.password, this.shopName);
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


}
