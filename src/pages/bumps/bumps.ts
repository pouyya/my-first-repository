import { BumpDetails } from './../bump-details/bump-details';
import { Component, NgZone } from '@angular/core';
import { Device } from "../../model/store";
import { NavController, LoadingController } from 'ionic-angular';
import { SyncContext } from "../../services/SyncContext";

@Component({
  selector: 'bump',
  templateUrl: 'bumps.html',
})
export class Bumps {

  protected items: Device[] = [];
  constructor(public navCtrl: NavController,
    private syncContext: SyncContext,
    protected zone: NgZone,
    private loading: LoadingController
  ) {
  }

  async ionViewDidEnter() {
    let loader = this.loading.create({ content: 'Loading Employees...' });
    await loader.present();
    this.items = await this.syncContext.currentStore.devices || [];
    loader.dismiss();
  }

  public showDetail(device: Device) {
    this.navCtrl.push(BumpDetails, { device });
  }


}