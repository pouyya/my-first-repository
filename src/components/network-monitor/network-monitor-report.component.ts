import { Network } from '@ionic-native/network';
import { Component } from '@angular/core';
import { NetworkService } from '../../services/networkService';

@Component({
  selector: '[network-monitor-report]',
  template: `<ion-icon [name]="networkIcon"></ion-icon>`,
  styles: [
    ``
  ]
})

export class NetworkMonitorReportComponent {

  public networkIcon: string = 'eye';

  constructor(
    private network: Network,
    private networkService: NetworkService
  ) {
    this.network.onDisconnect().subscribe(() => {
      this.networkIcon = "eye-off";
      this.announce(false);
    });

    this.network.onConnect().subscribe(() => {
      this.networkIcon = "eye";
      this.announce(true);
    });
  }

  public announce(status: boolean) {
    this.networkService.announceStatus(status);
  }

}