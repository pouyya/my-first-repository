import { CategoryIconSelectModal } from './modals/category-icon-select/category-icon-select';
import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, AlertController, ModalController } from 'ionic-angular';
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
    private viewCtrl: ViewController,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController) {
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

  public saveCategories() {
    if (this.isNew) {
      this.categoryService.add(this.categoryItem)
        .catch(console.error.bind(console));
    } else {
      this.categoryService.update(this.categoryItem)
        .catch(console.error.bind(console));
    }

    this.navCtrl.pop();

  }

  public selectIcon() {
    let modal = this.modalCtrl.create(CategoryIconSelectModal, { selectedIcon: this.selectedIcon });
    modal.onDidDismiss(data => {
      
    });
    modal.present();    
  }

  public previewIcon(icon: any) {
    let alert = this.alertCtrl.create({
      title: icon.name,
      subTitle: `<ion-icon name="${icon.name}"></ion-icon>`,
      buttons: ['OK']
    });
    alert.present();
  }

  addImage() {

  }
}
