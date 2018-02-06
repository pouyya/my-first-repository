import { ViewController, ToastController } from 'ionic-angular';
import { AuthService } from './../../../../services/authService';
import { Component } from '@angular/core';

@Component({
  selector: "forgot-password",
  templateUrl: "forgot-password.html"
})
export class ForgotPassword {

  public email: string;

  constructor(
    private authService: AuthService, 
    private viewCtrl: ViewController,
    private toastCtrl: ToastController
  ) { }

  public sendEmail() {
    this.authService.checkForValidEmail(this.email).finally(() => this.viewCtrl.dismiss())
    .subscribe((data) => {
      if(data._body.found) {
        let toast = this.toastCtrl.create({
          message: "An email will be send to you shortly",
          duration: 3000
        });
        toast.present();
      }
    }, error => {
      let toast = this.toastCtrl.create({
        message: error.message,
        duration: 3000
      });
      toast.present();
    });
  }

  public dismiss(): void {
    this.viewCtrl.dismiss();
  }

}