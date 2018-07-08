import { Network } from '@ionic-native/network';
import { Component } from "@angular/core";

@Component({
  selector: '[network-enable-page]',
  template: `enablePage`,
  styles: [
    ``
  ]
})
export class NetworkMonitorEnablePageComponent {

  public enablePage: string = "class=''";

  constructor(private network: Network) {
    this.network.onDisconnect().subscribe(() => this.enablePage = " 'class-a'");
    this.network.onConnect().subscribe(() => this.enablePage = " 'class-b'");

  }
}