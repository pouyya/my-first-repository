import { Category } from './../../model/category';
import { CategoryIconSelectModal } from './modals/category-icon-select/category-icon-select';
import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, ToastController } from 'ionic-angular';
import { CategoryService } from '../../services/categoryService';
import { icons } from '@simpleidea/simplepos-core/dist/metadata/itemIcons';
import { UserService } from '../../modules/dataSync/services/userService';
import { Subject } from "rxjs/Subject";

@Component({
  selector: 'page-variables',
  templateUrl: 'category-details.html'
})
export class CategoryDetails {
  public categoryItem: Category = new Category();
  public isNew = true;
  public action = 'Add';
  public icons: any;
  private color: Subject<string> = new Subject<string>();
  public selectedIcon: string = "";

  constructor(public navCtrl: NavController,
    private categoryService: CategoryService,
    private userService: UserService,
    private navParams: NavParams,
    private toastCtrl: ToastController,
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

    this.color.asObservable().subscribe( color => {
      this.categoryItem.color = color;
    });
    this.color.next(this.categoryItem.color);
  }

  public async onSubmit() {
    try {
      this.categoryItem.order = Number(this.categoryItem.order);
      await this.categoryService[this.isNew ? 'add':'update'](this.categoryItem);
      let toast = this.toastCtrl.create({
        message: `Category '${this.categoryItem.name}' has been created successfully!`,
        duration: 3000
      });
      toast.present();
      this.navCtrl.pop();
    } catch (err) {
      throw new Error(err);
    }
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
}
