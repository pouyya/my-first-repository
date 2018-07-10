import { Network } from '@ionic-native/network';
import { Component } from "@angular/core";
import { Events } from 'ionic-angular';

@Component({
  selector: '[network-enable-page]',
  template: `<ion-icon [name]="networkIcon"></ion-icon>`,
  styles: [
    ``
  ]
})
export class NetworkMonitorEnablePageComponent {

  public networkIcon: string = "eye";

  constructor(private network: Network,
    private eventCtrl: Events) {
    this.network.onDisconnect().subscribe(() => {
      this.networkIcon = "eye-off";
      console.log('Offline event was detected.');
      this.eventCtrl.publish('network:offline');
    });
    this.network.onConnect().subscribe(() => {
      this.networkIcon = "eye";
      console.log('Online event was detected.');
      this.eventCtrl.publish('network:online');
    });

  }
}