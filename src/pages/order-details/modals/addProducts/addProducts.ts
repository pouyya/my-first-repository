import { NavParams, ViewController } from 'ionic-angular';
import { Component } from '@angular/core';
import { Product } from '../../../../model/product';

interface SelectableProduct extends Product {
  selected: boolean;
}

@Component({
  selector: 'add-products',
  templateUrl: 'addProducts.html'
})
export class AddProducts {

  public products: SelectableProduct[] = [];
  public productsBackup: SelectableProduct[] = [];

  constructor(
    private navParams: NavParams,
    private viewCtrl: ViewController
  ) {
    this.products = <SelectableProduct[]>navParams.get('products').map(product => {
      product.selected = false;
      return product;
    });
    this.productsBackup = this.products;
  }

  public add() {
    this.viewCtrl.dismiss(<Product[]>this.products
      .filter(product => product.selected)
      .map(product => {
        delete product.selected;
        return product;
      }));
  }

  public search(event) {
    let val = event.target.value;
    this.products = this.productsBackup;
    if (val && val.trim() != '') {
      this.products = this.products.filter(item => {
        return ((item.name).toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }

  public dismiss() {
    this.viewCtrl.dismiss();
  }

}