import { ViewController, ToastController } from 'ionic-angular';
import { AuthService } from './../../../../services/authService';
import { Component } from '@angular/core';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/catch';


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

    public async sendEmail() {
        await this.authService.resetPassword(this.email)
            .then((data) => {
                let toast = this.toastCtrl.create({
                    message: "An email will be send to you shortly",
                    duration: 3000
                });
                toast.present();
            }, error => {
                console.log(error);
                let toast = this.toastCtrl.create({
                    message: 'Invalid Email!',
                    duration: 3000
                });
                toast.present();
            }
            ), always => { () => this.viewCtrl.dismiss() };
    }

    public dismiss(): void {
        this.viewCtrl.dismiss();
    }

}