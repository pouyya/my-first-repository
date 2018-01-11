import _ from 'lodash';
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
    let selectedProductIds = <string[]>navParams.get('selectedProductIds');
    let products = navParams.get('products');
    let generateSelectableProducts = (products: any[]) => {
      return products.map(product => {
        product.selected = false;
        return product;
      })
    }
    this.products = <SelectableProduct[]>((func: Function) => {
      return func(selectedProductIds && selectedProductIds.length > 0 ? 
        _.reject(products, (item) => selectedProductIds.indexOf(item._id) > -1) : products);
    })(generateSelectableProducts);
    this.productsBackup = this.products;
  }

  public addProduct() {
    /** Filters out selected products, and then removes their selected property  */
    let products: Product[] = this.products
      .filter(product => product.selected)
      .map(product => {
        delete product.selected;
        return product;
      })
    this.viewCtrl.dismiss({
      products,
      productsLeft: this.products.length - products.length
    });
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