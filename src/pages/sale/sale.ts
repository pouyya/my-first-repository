import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';

/**
 * TODO: Resolve items into componenets into separate files
 */

export class Products {
  id: number;
  categoryId: number;
  name: string;
}

export class Services {
  id: number;
  categoryId: number;
  name: string;
}

export class Packages {
  id: number;
  categoryId: number;
  name: string;
}

@Component({
  selector: 'page-variables',
  templateUrl: 'sale.html'
})
export class SalePage {

  constructor(public navCtrl: NavController, public alertCtrl: AlertController) {
    this.categories = [
      { id: 1, name: "Cutting" },
      { id: 2, name: "Wax" },
      { id: 3, name: "Facial" },
      { id: 4, name: "Grooming" }
    ];

    this.products = [
      { id: 5, categoryId: 2, name: 'Alovera Wax' },
      { id: 6, categoryId: 2, name: 'Orange Wax' }
    ];

    this.services = [
      { id: 7, categoryId: 2, name: 'Primal Waxing' },
      { id: 8, categoryId: 1, name: 'Afro Cut' },
      { id: 9, categoryId: 1, name: 'Fauji Cut' },
      { id: 10, categoryId: 3, name: 'Normal Facial' },
      { id: 11, categoryId: 3, name: 'Herbal Facial' },
      { id: 12, categoryId: 3, name: 'Whitening Facial' },
      { id: 13, categoryId: 3, name: 'Bleaching' },
    ];

    this.packages = [
      { id: 14, categoryId: 3, name: 'Primal Orange Waxing' },
      { id: 15, categoryId: 3, name: 'Facial + Masking' }
    ];

    this._init();
  }

  activeCategory: any;
  activeItems: Array<any>;
  categories: Array<{ id: number, name: string }>;
  products: Array<Products>;
  services: Array<Services>;
  packages: Array<Packages>;

  private _init() {
    this.activeCategory = this.categories[0];
    this.activeItems = this._mapItemsToCategory(this.activeCategory.id);
  }

  private _mapItemsToCategory(categoryId) {
    let items: Array<any> = [];
    this.products.forEach(product => product.categoryId === categoryId && (items.push(product)));
    this.services.forEach(service => service.categoryId === categoryId && (items.push(service)));
    this.packages.forEach(pkg => pkg.categoryId === categoryId && (items.push(pkg)));
    return items;
  }

  public itemSelected(category) {
    this.activeCategory = category;
    this.activeItems = this._mapItemsToCategory(category.id);
    return category.id == category.id;
  }

  public selectItem(item) {
    let alert = this.alertCtrl.create({
      title: item.name,
      buttons: ['OK']
    });
    alert.present();
  }  
}