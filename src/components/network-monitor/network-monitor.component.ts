import { DBEvent } from './../../db/dbEvent';
import { DBService } from './../../services/DBService';
import { Network } from '@ionic-native/network';
import { Component } from "@angular/core";

@Component({
  selector: '[network-monitor]',
  template: `<button ion-button icon-only class="bar-button bar-button-md bar-button-default bar-button-default-md">
        <ion-icon [name]="networkIcon"></ion-icon>
      </button>
      <button ion-button *ngIf="syncing" icon-only class="bar-button bar-button-md bar-button-default bar-button-default-md">
        <ion-spinner name="crescent"></ion-spinner></button>`,
  styles: [
    `button > ion-spinner * {
      width: 28px;
      height: 28px;
      stroke: white;
      fill: white;
    }`
  ]
})
export class NetworkMonitorComponent {
  public networkIcon: string = 'eye';
  public syncing: boolean = false;

  constructor(private network: Network) {
    this.network.onDisconnect().subscribe(() => this.networkIcon = "eye-off");
    this.network.onConnect().subscribe(() => this.networkIcon = "eye");

    DBService.criticalDBSyncProgress.subscribe(
      (data: DBEvent) => {
        data && (this.syncing = data.isActive);
      }
    );

    DBService.dbSyncProgress.subscribe(
      (data: DBEvent) => {
        data && (this.syncing = data.isActive);
      }
    );
  }
}