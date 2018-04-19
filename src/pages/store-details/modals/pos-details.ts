import * as moment from 'moment';
import { AppService } from './../../../services/appService';
import { NavParams, ViewController, ToastController, AlertController, LoadingController } from 'ionic-angular';
import { POS } from './../../../model/store';
import { Component, Injector } from '@angular/core';
import { SyncContext } from "../../../services/SyncContext";
import { StoreService } from "../../../services/storeService";
@Component({
  selector: "pos-details-modal",
  templateUrl: 'pos-details.html'
})
export class PosDetailsModal {
  public pos: POS = new POS();
  public isNew: boolean = true;
  public action: string = 'Add';
  private appService: AppService;

  constructor(
    private navParams: NavParams,
    private storeService: StoreService,
    private viewCtrl: ViewController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private loading: LoadingController,
    private syncContext: SyncContext,
    private injector: Injector
  ) { }

  ionViewDidEnter() {
    let pos = this.navParams.get('pos');
    if (pos && pos.id !== "") {
      this.pos = pos;
      this.isNew = false;
      this.action = 'Edit';
    }
  }

  public async save() {
    if (this.isNew) {
      this.pos.id = moment().utc().format('YYYY-MM-DDTHH:mm:ss.SSSSSSS');
      this.viewCtrl.dismiss({ status : 'add', pos: this.pos});
    } else {
      this.viewCtrl.dismiss({ status : 'edit', pos: this.pos});
    }
  }

  public dismiss() {
      this.viewCtrl.dismiss(null);
  }

  public async remove() {
    this.appService = this.appService || this.injector.get(AppService);
    let confirm = this.alertCtrl.create({
      title: 'Are you sure you want to delete this POS ?',
      message: 'Deleting this POS, will delete all associated Sales and any Current Sale!',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            if (this.syncContext.currentPos.id == this.pos.id) {
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
                  this.viewCtrl.dismiss({ status : 'remove', pos: this.pos});
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