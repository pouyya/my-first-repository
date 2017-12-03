import { AppService } from './../../services/appService';
import { UserService } from './../../services/userService';
import { NavParams, NavController, ToastController, AlertController, LoadingController } from 'ionic-angular';
import { PosService } from './../../services/posService';
import { POS } from './../../model/pos';
import { Component } from '@angular/core';
@Component({
  selector: "pos-details",
  templateUrl: 'pos-details.html'
})
export class PosDetailsPage {
  public pos: POS = new POS();
  public isNew: boolean = true;
  public action: string = 'Add';

  constructor(
    private navParams: NavParams,
    private posService: PosService,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private loading: LoadingController,
    private userService: UserService,
    private appService: AppService
  ) { }

  ionViewDidEnter() {
    var pos = this.navParams.get('pos');
    var storeId = this.navParams.get('storeId');
    if (pos) {
      this.pos = pos;
      this.isNew = false;
      this.action = 'Edit'
    } else {
      this.pos.storeId = storeId;
    }
  }

  public save() {
    if (this.isNew) {
      this.posService.add(this.pos).then(() => {
        let toast = this.toastCtrl.create({
          message: 'Register has been added successfully',
          duration: 3000
        });
        toast.present();
        this.navCtrl.pop();
      }, (error) => {
        throw new Error(error);
      })
    } else {
      this.posService.update(this.pos)
        .catch(console.error.bind(console));
    }
    this.navCtrl.pop();
  }

  public async remove() {
    let user = await this.userService.getUser();
    let confirm = this.alertCtrl.create({
      title: 'Are you sure you want to delete this POS ?',
      message: 'Deleting this POS, will delete all associated Sales and any Current Sale!',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            if (user.currentPos == this.pos._id) {
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