import { AppService } from './../../services/appService';
import _ from 'lodash';
import { NavParams, NavController, ToastController, AlertController, LoadingController } from 'ionic-angular';
import { PosService } from './../../services/posService';
import { POS } from './../../model/pos';
import { Component } from '@angular/core';
import { SyncContext } from "../../services/SyncContext";
import {DeviceService} from "../../services/deviceService";
import {Device} from "../../model/device";
@Component({
  selector: "pos-details",
  templateUrl: 'device-details.html'
})
export class PosDetailsPage {
  public posList: POS[] = [];
  public remainingPosList: POS[] = [];
  public isNew: boolean = true;
  public action: string = 'Add';

  constructor(
    private navParams: NavParams,
    private device: Device,
    private posService: PosService,
    private deviceService: DeviceService,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private loading: LoadingController,
    private syncContext: SyncContext
  ) { }

  async ionViewDidEnter() {
    this.device = this.navParams.get('device');
    const currentStorePos = await this.posService.getCurrentStorePos();
    this.device.posIds.forEach(posId => {
      posId = currentStorePos[posId];
    });

    // this.navPopCallback = this.navParams.get("pushCallback")
    if (this.device && this.device._id !== "") {
      this.isNew = false;
      this.action = 'Edit';
    }
  }

  public async save() {
    if (this.isNew) {
      // await this.navPopCallback(this.pos);
      this.navCtrl.pop();
    } else {
      await this.deviceService.update(this.device);
      this.navCtrl.pop();
    }
  }

  public async remove( ) {
    let confirm = this.alertCtrl.create({
      title: 'Are you sure you want to delete this Device ?',
      message: 'Deleting this device, will delete all associated Sales and any Current Sale!',
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
                this.deviceService.remove(this.device).then(() => {
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