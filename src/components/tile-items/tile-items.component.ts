import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AlertController } from 'ionic-angular';

@Component({
  selector: 'tile-items',
  templateUrl: 'tile-items.html',
  styleUrls: ['/components/tile-items/tile-items.scss']
})
export class TileItemsComponent {
  @Input() items: Array<any>;
  @Input() selectedItems: Array<any>;
  @Output() onSelect = new EventEmitter<Object>();

  constructor(private alertController: AlertController) { }

  public selectItem(item) {
    let proceed: boolean = true;
    this.selectedItems.forEach((i, $i) => {
      i._id === item._id && (proceed = false);
    });
    if(proceed) {
      if(item.price) {
        this.selectedItems.push(item);
        this.onSelect.emit(item);
      } else {
        let alert = this.alertController.create({
          title: "Item don't have any price",
          buttons: ['OK']
        });
        alert.present();
      }
    } else {
      let alert = this.alertController.create({
        title: "This item has already been added. Please update quantity if requried!",
        buttons: ['OK']
      });
      alert.present();      
    }
  }
}