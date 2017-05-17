import { Component, Input } from '@angular/core';
import { AlertController } from 'ionic-angular';

@Component({
  selector: 'tile-items',
  templateUrl: 'tile-items.html',
  styles: [
    `
    .tile {
      margin: 5px 5px 5px 5px;
      width: 100%;
      height: 100px;
      font-size: 1.4rem;
      background: #EBEBEB;
      display: inline-block;
      vertical-align: top;
      border: 5px solid darkgray;
      padding: 3px 3px 3px 3px;
      cursor: pointer;
      box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.12);  
    }
    `
  ]
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