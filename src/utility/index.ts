import { Injectable } from "@angular/core";
import { AlertController, ToastController } from "ionic-angular";

@Injectable()
export class Utilities {
    constructor(private alertCtrl: AlertController, private toastCtrl:ToastController){}

    public checkUnsavedChanges(isDataChanged) {
        return new Promise<boolean>((resolve) => {
            if (isDataChanged) {
                let confirm = this.alertCtrl.create({
                    title: 'Warning!',
                    message: 'There is unsaved data. Do you want to discard it?',
                    buttons: [
                        {
                            text: 'Discard It!',
                            handler: async () => {
                                resolve(true);
                                let toast = this.toastCtrl.create({
                                    message: 'The unsaved changes are now discarded.',
                                    duration: 5000
                                });
                                toast.present();
                            }
                        },
                        {
                            text: 'Let me save',
                            handler: () => {
                                resolve(false);
                            }
                        }
                    ]
                });
                confirm.present();
            } else {
                resolve(true);
            }
        });
    }
}