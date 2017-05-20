import { Component, Input } from '@angular/core';
import { AlertController } from 'ionic-angular';

@Component({
  selector: 'tile-items',
  templateUrl: 'tile-items.html',
  styleUrls: ['/components/tile-items/tile-items.scss']
})
export class TileItemsComponent {
  @Input() items: Array<any>;

  constructor(private alertController: AlertController) { }

  public selectItem(item) {
    let alert = this.alertController.create({
      title: item.name,
      buttons: ['OK']
    });
    alert.present();
  }    
}