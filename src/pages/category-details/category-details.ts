import { Category } from './../../model/category';
import { UserService } from './../../services/userService';
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
  public categoryItem: Category = new Category();
  public isNew = true;
  public action = 'Add';
  public icons: any;
  public selectedIcon: string = "";

  constructor(public navCtrl: NavController,
    private categoryService: CategoryService,
    private userService: UserService,
    public navParams: NavParams,
    private viewCtrl: ViewController,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController) {
    this.icons = icons;
  }

  async ionViewDidLoad() {
    let editProduct = this.navParams.get('category');
    if (editProduct) {
      this.categoryItem = editProduct;
      this.isNew = false;
      this.action = 'Edit';
      if(this.categoryItem.hasOwnProperty('icon') && this.categoryItem.icon) {
        this.selectedIcon = this.categoryItem.icon.name;
      }
    } else {
			let user = await this.userService.getUser();
			this.categoryItem.icon = user.settings.defaultIcon;
			this.selectedIcon = this.categoryItem.icon.name;
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
      if(data.status) {
        this.selectedIcon = data.selected;
        this.categoryItem.icon = this.icons[this.selectedIcon];
      }
    });
    modal.present();    
  }

  addImage() {

  }
}
