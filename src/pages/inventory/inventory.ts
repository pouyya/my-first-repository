import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { BackOfficeModule } from '../../modules/backOfficeModule';
import { PageModule } from '../../metadata/pageModule';

@PageModule(() => BackOfficeModule)
@Component({
  selector: 'page-variables',
  templateUrl: 'inventory.html'
})
export class InventoryPage {
  public products = [];
  stock:   any;
  qty:     any;
  unit:    any;
  reOrder: any;
  constructor(public navCtrl: NavController) {

  }

  saveProducts(){

  }
  getItems(event){
    
  }
}
