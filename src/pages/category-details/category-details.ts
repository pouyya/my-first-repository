import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { CategoryService } from '../../services/categoryService';
import { icons } from './../../metadata/itemIcons';

@Component({
  selector: 'page-variables',
  templateUrl: 'category-details.html'
})
export class CategoryDetails {
  public categoryItem: any = {};
  public isNew = true;
  public action = 'Add';
  public icons: any;
  public selectedIcon: any;

  constructor(public navCtrl: NavController,
    private categoryService: CategoryService,
    public navParams: NavParams,
    private viewCtrl: ViewController) {
    this.icons = icons;
  }

  ionViewDidLoad() {
    let editProduct = this.navParams.get('category');
    console.log('Get from DB Category Items', editProduct);
    if (editProduct) {
      this.categoryItem = editProduct;
      this.isNew = false;
      this.action = 'Edit';
    }
  }

  saveCategories() {
    if (this.isNew) {
      this.categoryService.add(this.categoryItem)
        .catch(console.error.bind(console));
    } else {
      this.categoryService.update(this.categoryItem)
        .catch(console.error.bind(console));
    }

    this.navCtrl.pop();

  }

  addImage() {

  }
}
