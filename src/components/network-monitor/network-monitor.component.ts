import { DBEvent } from '@simplepos/core/dist/db/dbEvent';
import { DBService } from '@simplepos/core/dist/services/dBService';
import { Network } from '@ionic-native/network';
import { Component } from "@angular/core";

@Component({
  selector: '[network-monitor]',
  template: `<button class="no-cursor bar-button bar-button-md bar-button-default bar-button-default-md" ion-button icon-only clear >
        <ion-icon [name]="networkIcon"></ion-icon>
      </button>
      <button class="no-cursor bar-button bar-button-md bar-button-default bar-button-default-md" ion-button icon-only clear >
          <ion-icon [name]="syncIcon"></ion-icon>
        </button>`,
  styles: [
    `button > ion-spinner * {
      width: 28px;
      height: 28px;
      stroke: white;
      fill: white;
    }
    .no-cursor {
        pointer-events: none;
        cursor: default;
    }
    `
  ]
})
export class NetworkMonitorComponent {

  public networkIcon: string = 'eye';
  public syncIcon: string = 'cloud-outline';

  constructor(private network: Network) {
    this.network.onDisconnect().subscribe(() => this.networkIcon = "eye-off");
    this.network.onConnect().subscribe(() => this.networkIcon = "eye");

    DBService.pouchDBProvider.criticalDBSyncProgress.subscribe(
      (data: DBEvent) => {
        data && (this.syncIcon = data.isActive ? 'cloud-upload' : 'cloud-outline');
      }
    );

    DBService.pouchDBProvider.dbSyncProgress.subscribe(
      (data: DBEvent) => {
        data && (this.syncIcon = data.isActive ? 'cloud-upload' : 'cloud-outline');
      }
    );
  }
}