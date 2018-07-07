import { ViewController, ToastController } from 'ionic-angular';
import { AuthService, ServerResponse } from './../../../../services/authService';
import { Component } from '@angular/core';
import { LoadingController } from "ionic-angular";
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/catch';


@Component({
    selector: "forgot-password",
    templateUrl: "forgot-password.html"
})
export class ForgotPassword {

    public email: string;
    public serverResponse: ServerResponse[] = [];

    constructor(
        private authService: AuthService,
        private viewCtrl: ViewController,
        private toastCtrl: ToastController,
        private loading: LoadingController
    ) { }

    public async sendEmail() {
        let loader = this.loading.create({ content: 'Sending Request to server...', });
        await loader.present();

        var serverRes = await this.authService.resetPassword(this.email);
        serverRes.subscribe(response => {
            if(response.length>0){
            this.serverResponse = response;
            loader.dismiss();
            this.toast();
            }
        },
        err => {
          console.log(err);
          loader.dismiss();
        } );
    }

    private toast() {
        if (this.serverResponse[0])
            if (this.serverResponse[0]['Status'] == 200) {
                let toast = this.toastCtrl.create({
                    message: "An email will be send to you shortly",
                    duration: 5000
                });
                toast.present();
                this.viewCtrl.dismiss()
            }
            else {
                let toast = this.toastCtrl.create({
                    message: 'Invalid Email!',
                    duration: 5000
                });
                toast.present();
            }
    }

    private dismiss(){
        this.viewCtrl.dismiss()
    }
}