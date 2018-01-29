import { DBService } from '@simpleidea/simplepos-core/dist/services/dBService';
import { Component } from "@angular/core";
import { LoadingController, NavController, AlertController } from "ionic-angular";
import { Storage } from '@ionic/storage';
import { LoginPage } from "../login/login";

@Component({
  selector: 'logout',
  template: ``
})
export class LogOut {

  constructor(
    private loading: LoadingController,
    private navCtrl: NavController,
    private storage: Storage,
    private alertCtrl: AlertController) {
  }

  async ionViewCanEnter(): Promise<boolean> {
    return new Promise<boolean>(async resolve => {
      let confirm = this.alertCtrl.create({
        title: 'Are you sure you want to logout?',
        message: 'Logout will delete all of your local data but your data which is saved will be saved on server',
        buttons: [
          {
            text: 'Yes',
            handler: () => resolve(true)
          },
          {
            text: 'No',
            handler: () => resolve(false)
          }
        ]
      });
      
      await confirm.present();

    });
  }

  async ionViewDidLoad() {
    let loader = this.loading.create({
      content: 'Logging Out...'
    });
    try {
      await loader.present();
      await this.storage.clear();
      await DBService.destroyInternals();
      localStorage.clear();
      loader.dismiss();
      this.navCtrl.setRoot(LoginPage);
    } catch (err) {
      throw new Error(err);
    }
  }

}