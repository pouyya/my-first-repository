import { DBService } from './../../services/DBService';
import { Network } from '@ionic-native/network';
import { Component } from "@angular/core";

@Component({
  selector: '[network-monitor]',
  template: `<button ion-button icon-only class="bar-button bar-button-md bar-button-default bar-button-default-md">
        <ion-icon [name]="networkIcon"></ion-icon>
      </button>
      <button *ngIf="syncing" ion-button icon-only class="bar-button bar-button-md bar-button-default bar-button-default-md">
        <ion-icon name="sync"></ion-icon></button>`
})
export class NetworkMonitorComponent {
  public networkIcon: string = 'eye';
  public syncing: boolean = false;

  constructor(private network: Network) {
    this.network.onDisconnect().subscribe(() => this.networkIcon = "eye-off");
    this.network.onConnect().subscribe(() => this.networkIcon = "eye");

    DBService.criticalDBSyncProgress.subscribe(
      async data => {
        this.syncing = data === 1;
      }
    );

    DBService.dbSyncProgress.subscribe(
      async data => {
        this.syncing = data === 1;
      }
    );
  }
}