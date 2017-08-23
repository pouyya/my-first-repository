import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AlertController, ActionSheetController } from 'ionic-angular';
import { DragulaService } from 'ng2-dragula/ng2-dragula';

@Component({
  selector: 'tile-items',
  templateUrl: 'tile-items.html',
  styleUrls: ['/components/tile-items/tile-items.scss']
})
export class TileItemsComponent {
  @Input() items: Array<any>;
  @Input() activeEmployee: any | null;
  @Output() onSelect = new EventEmitter<Object>();

  constructor(
    private alertController: AlertController,
    private dragulaService: DragulaService,
    private actionSheetCtrl: ActionSheetController
  ) {
    dragulaService.drop.subscribe((value) => {
      let alert = this.alertController.create({
        title: 'Item moved',
        subTitle: 'So much fun!',
        buttons: ['OK']
      });
      alert.present();
    });
  }

  public selectItem(item) {
    this.onSelect.emit(item);
  }
}