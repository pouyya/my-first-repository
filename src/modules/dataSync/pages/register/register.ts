import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { AuthService } from '../../services/authService';
import { DataSync } from '../dataSync/dataSync';

@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
  styleUrls: ['/pages/register/register.scss'],
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
    private toastCtrl: ToastController,
    public navCtrl: NavController) {
  }

  public async register(): Promise<any> {

    let loader = this.loading.create({
      content: 'Register you account, please sit tight...'
    });

    await loader.present();

    this.authService.register(this.firstName, this.lastName, this.phone
      , this.email, this.password, this.password, this.shopName).subscribe(
      async data => {
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
      },
      error => {
        var errorMessage = "There is a problem in registration process, please contact admin@simplepos.com.au";

        if(error){
          var errors = error.json().Errors;
          if(errors){
            errorMessage = errors.join(", ");
          }
        }
        let toast = this.toastCtrl.create({
          message: errorMessage,
          duration: 3000
        });
        toast.present();
        loader.dismiss();
      });
  }

  navigateToDataSync() {
    return this.navCtrl.setRoot(DataSync);
  }
}
