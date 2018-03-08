import { AppService } from './../../services/appService';
import { NavParams, NavController, ToastController, AlertController, LoadingController } from 'ionic-angular';
import { PosService } from './../../services/posService';
import { POS } from './../../model/pos';
import { Component } from '@angular/core';
import { UserService } from '../../modules/dataSync/services/userService';
import { SyncContext } from "../../services/SyncContext";
@Component({
  selector: "pos-details",
  templateUrl: 'pos-details.html'
})
export class PosDetailsPage {
  public pos: POS = new POS();
  public isNew: boolean = true;
  public action: string = 'Add';
  private navPopCallback: any;

  constructor(
    private navParams: NavParams,
    private posService: PosService,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private loading: LoadingController,
    private userService: UserService,
    private appService: AppService,
    private syncContext: SyncContext
  ) { }

  ionViewDidEnter() {
    let pos = this.navParams.get('pos');
    this.navPopCallback = this.navParams.get("pushCallback")
    if (pos && pos._id !== "") {
      this.pos = pos;
      this.isNew = false;
      this.action = 'Edit';
    }
  }

  public async save() {
    if (this.isNew) {
      await this.navPopCallback(this.pos);
      this.navCtrl.pop();
    } else {
      await this.posService.update(this.pos);
      this.navCtrl.pop();
    }
  }

  public async remove() {
    let confirm = this.alertCtrl.create({
      title: 'Are you sure you want to delete this POS ?',
      message: 'Deleting this POS, will delete all associated Sales and any Current Sale!',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            if (this.syncContext.currentPos._id == this.pos._id) {
              let toast = this.toastCtrl.create({
                message: 'ERROR: This is your current POS. Please switch to other one before deleting it.',
                duration: 3000
              });
              toast.present();
            } else {
              let loader = this.loading.create({
                content: 'Deleting. Please Wait!',
              });

              loader.present().then(() => {
                this.appService.deletePos(this.pos).then(() => {
                  let toast = this.toastCtrl.create({
                    message: 'Pos has been deleted successfully',
                    duration: 3000
                  });
                  toast.present();
                  this.navCtrl.pop();
                }).catch(error => {
                  throw new Error(error);
                }).then(() => loader.dismiss());
              });
            }
          }
        }, 'No'
      ]
    });

    confirm.present();
  }
}