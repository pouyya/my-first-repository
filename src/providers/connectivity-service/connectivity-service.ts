import { Platform, AlertController } from 'ionic-angular';
import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network';

@Injectable()
export class ConnectivityServiceProvider {

  onDevice: boolean;

  constructor(
    public platform: Platform,
    public alertCtrl: AlertController,
  ) {
    this.onDevice = this.platform.is('cordova');
  }

  isOnline(): boolean {
    if (this.onDevice && Network.type) {
      return Network.type !== Connection.NONE;
    } else {
      return navigator.onLine;
    }
  }

  isOffline(): boolean {
    if (this.onDevice && Network.type) {
      return Network.type === Connection.NONE;
    } else {
      return !navigator.onLine;
    }
  }

}
