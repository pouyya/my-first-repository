import { DBService } from './../../services/DBService';
import { Component } from "@angular/core";
import { LoadingController, NavController } from "ionic-angular";
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
    private storage: Storage) {
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